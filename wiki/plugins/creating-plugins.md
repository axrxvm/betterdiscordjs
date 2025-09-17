# Creating Plugins

Plugins in @axrxvm/betterdiscordjs allow you to create modular, reusable functionality that can be easily shared and maintained. This guide will walk you through creating your own plugins.

## Plugin Structure

### Basic Plugin Class

All plugins extend the `BasePlugin` class:

```javascript
const { BasePlugin } = require('@axrxvm/betterdiscordjs');

class MyPlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    
    this.name = 'myplugin';
    this.version = '1.0.0';
    this.description = 'A sample plugin';
    this.author = 'Your Name';
    
    // Optional: Plugin dependencies
    this.dependencies = ['anotherplugin'];
    
    // Optional: Plugin configuration
    this.config = {
      enabled: true,
      setting1: 'default_value'
    };
  }

  // Called when plugin is loaded
  async onLoad() {
    this.bot.logger.info(`${this.name} plugin loaded!`);
    
    // Register commands, events, etc.
    this.registerCommands();
    this.registerEvents();
  }

  // Called when plugin is unloaded
  async onUnload() {
    this.bot.logger.info(`${this.name} plugin unloaded!`);
    
    // Cleanup resources
    this.cleanup();
  }

  // Register plugin commands
  registerCommands() {
    this.bot.command('mycommand', async (ctx) => {
      await ctx.reply('Hello from my plugin!');
    }, 'A command from my plugin');
  }

  // Register plugin events
  registerEvents() {
    this.bot.on('messageCreate', (ctx) => {
      // Handle message events
    });
  }

  // Cleanup method
  cleanup() {
    // Remove event listeners, clear timers, etc.
  }
}

module.exports = MyPlugin;
```

## Plugin Directory Structure

### File-Based Plugin

Create a plugin directory structure:

```
plugins/
└── myplugin/
    ├── index.js          # Main plugin file
    ├── commands/          # Plugin commands
    │   ├── hello.js
    │   └── info.js
    ├── events/            # Plugin events
    │   └── messageCreate.js
    ├── config.json        # Plugin configuration
    └── README.md          # Plugin documentation
```

### plugins/myplugin/index.js

```javascript
const { BasePlugin } = require('@axrxvm/betterdiscordjs');
const path = require('path');
const fs = require('fs');

class MyPlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    
    this.name = 'myplugin';
    this.version = '1.0.0';
    this.description = 'My awesome plugin';
    this.author = 'Your Name';
  }

  async onLoad() {
    // Load commands from commands directory
    await this.loadCommands();
    
    // Load events from events directory
    await this.loadEvents();
    
    this.bot.logger.info(`✅ ${this.name} plugin loaded successfully`);
  }

  async loadCommands() {
    const commandsDir = path.join(__dirname, 'commands');
    if (!fs.existsSync(commandsDir)) return;

    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const command = require(path.join(commandsDir, file));
      
      this.bot.command(command.name, command.execute, {
        description: command.description,
        ...command.options
      });
      
      this.bot.logger.info(`Loaded command: ${command.name}`);
    }
  }

  async loadEvents() {
    const eventsDir = path.join(__dirname, 'events');
    if (!fs.existsSync(eventsDir)) return;

    const eventFiles = fs.readdirSync(eventsDir).filter(file => file.endsWith('.js'));
    
    for (const file of eventFiles) {
      const event = require(path.join(eventsDir, file));
      
      this.bot.on(event.name, event.execute, event.once);
      this.bot.logger.info(`Loaded event: ${event.name}`);
    }
  }
}

module.exports = MyPlugin;
```

### plugins/myplugin/commands/hello.js

```javascript
module.exports = {
  name: 'hello',
  description: 'Say hello to someone',
  options: {
    slash: true,
    cooldown: '5s'
  },
  async execute(ctx) {
    const target = ctx.args[0] ? ctx.args.join(' ') : ctx.user.username;
    await ctx.reply(`Hello, ${target}! 👋`);
  }
};
```

### plugins/myplugin/events/messageCreate.js

```javascript
module.exports = {
  name: 'messageCreate',
  async execute(ctx) {
    if (ctx.author.bot) return;
    
    // Plugin-specific message handling
    if (ctx.content.toLowerCase().includes('myplugin')) {
      await ctx.react('👋');
    }
  }
};
```

## Advanced Plugin Features

### Plugin Configuration

```javascript
class ConfigurablePlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    
    this.name = 'configurable';
    this.version = '1.0.0';
    
    // Default configuration
    this.defaultConfig = {
      enabled: true,
      prefix: '!',
      welcomeMessage: 'Welcome to the server!',
      channels: {
        welcome: null,
        logs: null
      }
    };
  }

  async onLoad() {
    // Load configuration
    this.config = await this.loadConfig();
    
    // Register commands with configuration
    this.registerCommands();
  }

  async loadConfig() {
    const config = await this.pluginManager.getPluginConfig(this.name);
    return { ...this.defaultConfig, ...config };
  }

  async saveConfig() {
    await this.pluginManager.setPluginConfig(this.name, this.config);
  }

  registerCommands() {
    // Configuration command
    this.bot.command('config', async (ctx) => {
      if (!ctx.hasPerms(['MANAGE_GUILD'])) {
        return ctx.reply('❌ You need Manage Server permission.');
      }

      const setting = ctx.args[0];
      const value = ctx.args.slice(1).join(' ');

      if (!setting) {
        return ctx.reply(`Current config:\n\`\`\`json\n${JSON.stringify(this.config, null, 2)}\`\`\``);
      }

      if (!value) {
        return ctx.reply(`Current value for ${setting}: \`${this.config[setting]}\``);
      }

      this.config[setting] = value;
      await this.saveConfig();
      
      ctx.reply(`✅ Set ${setting} to: \`${value}\``);
    }, 'Configure plugin settings');
  }
}
```

### Plugin Dependencies

```javascript
class DependentPlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    
    this.name = 'dependent';
    this.version = '1.0.0';
    this.dependencies = ['economy', 'leveling']; // Required plugins
  }

  async onLoad() {
    // Check if dependencies are loaded
    for (const dep of this.dependencies) {
      if (!this.pluginManager.isLoaded(dep)) {
        throw new Error(`Plugin ${this.name} requires ${dep} plugin`);
      }
    }

    // Access other plugins
    this.economyPlugin = this.pluginManager.getPlugin('economy');
    this.levelingPlugin = this.pluginManager.getPlugin('leveling');

    this.registerCommands();
  }

  registerCommands() {
    this.bot.command('reward', async (ctx) => {
      const userLevel = await this.levelingPlugin.getUserLevel(ctx.user.id);
      const reward = userLevel * 10;
      
      await this.economyPlugin.addCoins(ctx.user.id, reward);
      ctx.reply(`🎁 You received ${reward} coins for being level ${userLevel}!`);
    });
  }
}
```

### Plugin API

```javascript
class APIPlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    
    this.name = 'api';
    this.version = '1.0.0';
  }

  // Public API methods that other plugins can use
  async getUserData(userId) {
    return await this.bot.db.getUserConfig(userId);
  }

  async setUserData(userId, data) {
    return await this.bot.db.setUserConfig(userId, data);
  }

  async logAction(action, userId, details = {}) {
    const logEntry = {
      action,
      userId,
      timestamp: new Date().toISOString(),
      ...details
    };
    
    // Store in database or send to logging service
    console.log('Action logged:', logEntry);
  }

  // Event emitter for plugin communication
  emitPluginEvent(eventName, data) {
    this.bot.emit(`plugin:${this.name}:${eventName}`, data);
  }

  onPluginEvent(pluginName, eventName, handler) {
    this.bot.on(`plugin:${pluginName}:${eventName}`, handler);
  }
}
```

## Plugin Examples

### Economy Plugin

```javascript
class EconomyPlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    
    this.name = 'economy';
    this.version = '1.0.0';
    this.description = 'Simple economy system';
  }

  async onLoad() {
    this.registerCommands();
    this.registerEvents();
  }

  // API Methods
  async getBalance(userId) {
    return await this.bot.db.getUserConfig(userId, 'coins', 0);
  }

  async addCoins(userId, amount) {
    const current = await this.getBalance(userId);
    const newBalance = current + amount;
    await this.bot.db.setUserConfig(userId, 'coins', newBalance);
    return newBalance;
  }

  async removeCoins(userId, amount) {
    const current = await this.getBalance(userId);
    const newBalance = Math.max(0, current - amount);
    await this.bot.db.setUserConfig(userId, 'coins', newBalance);
    return newBalance;
  }

  registerCommands() {
    this.bot.command('balance', async (ctx) => {
      const balance = await this.getBalance(ctx.user.id);
      ctx.reply(`💰 You have **${balance}** coins!`);
    });

    this.bot.command('pay', async (ctx) => {
      const target = ctx.mentions.users.first();
      const amount = parseInt(ctx.args[1]);

      if (!target || !amount || amount <= 0) {
        return ctx.reply('Usage: !pay @user <amount>');
      }

      const senderBalance = await this.getBalance(ctx.user.id);
      if (senderBalance < amount) {
        return ctx.reply('❌ Insufficient funds!');
      }

      await this.removeCoins(ctx.user.id, amount);
      await this.addCoins(target.id, amount);

      ctx.reply(`✅ Paid **${amount}** coins to ${target}!`);
    });
  }

  registerEvents() {
    // Give coins for messages
    this.bot.on('messageCreate', async (ctx) => {
      if (ctx.author.bot) return;
      
      const coins = Math.floor(Math.random() * 5) + 1;
      await this.addCoins(ctx.author.id, coins);
    });
  }
}

module.exports = EconomyPlugin;
```

### Moderation Plugin

```javascript
class ModerationPlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    
    this.name = 'moderation';
    this.version = '1.0.0';
    this.description = 'Moderation tools';
  }

  async onLoad() {
    this.registerCommands();
  }

  registerCommands() {
    this.bot.command('kick', async (ctx) => {
      if (!ctx.hasPerms(['KICK_MEMBERS'])) {
        return ctx.reply('❌ You need Kick Members permission.');
      }

      const target = ctx.mentions.members.first();
      const reason = ctx.args.slice(1).join(' ') || 'No reason provided';

      if (!target) {
        return ctx.reply('Please mention a user to kick.');
      }

      if (!target.kickable) {
        return ctx.reply('❌ Cannot kick this user.');
      }

      try {
        await target.kick(reason);
        ctx.reply(`✅ Kicked ${target.user.tag} for: ${reason}`);
        
        // Log the action
        this.logModAction('kick', ctx.user, target.user, reason);
      } catch (error) {
        ctx.reply('❌ Failed to kick user.');
      }
    });

    this.bot.command('ban', async (ctx) => {
      if (!ctx.hasPerms(['BAN_MEMBERS'])) {
        return ctx.reply('❌ You need Ban Members permission.');
      }

      const target = ctx.mentions.members.first();
      const reason = ctx.args.slice(1).join(' ') || 'No reason provided';

      if (!target) {
        return ctx.reply('Please mention a user to ban.');
      }

      if (!target.bannable) {
        return ctx.reply('❌ Cannot ban this user.');
      }

      try {
        await target.ban({ reason });
        ctx.reply(`✅ Banned ${target.user.tag} for: ${reason}`);
        
        this.logModAction('ban', ctx.user, target.user, reason);
      } catch (error) {
        ctx.reply('❌ Failed to ban user.');
      }
    });
  }

  async logModAction(action, moderator, target, reason) {
    const logChannel = await this.bot.db.getGuildConfig(
      moderator.guild?.id, 
      'modLogChannel'
    );
    
    if (logChannel) {
      const channel = moderator.guild.channels.cache.get(logChannel);
      if (channel) {
        channel.send(`🔨 **${action.toUpperCase()}** | ${target.tag} was ${action}ed by ${moderator.tag}\n**Reason:** ${reason}`);
      }
    }
  }
}

module.exports = ModerationPlugin;
```

## Loading Plugins

### From Code

```javascript
const { Bot } = require('@axrxvm/betterdiscordjs');
const MyPlugin = require('./plugins/MyPlugin');

const bot = new Bot(token);

// Load plugin using .use() method (fluent API)
bot.use(MyPlugin);

// Or load after bot creation
bot.loadPluginFromClass(MyPlugin);

bot.start();
```

### From Files

```javascript
const bot = new Bot(token, {
  pluginsDir: './plugins' // Automatically loads all plugins from directory
});

bot.start();
```

## Plugin Management Commands

```javascript
// Built-in plugin management commands
bot.command('plugins', async (ctx) => {
  const plugins = bot.listPlugins();
  const pluginList = plugins.map(p => `${p.name} v${p.version} - ${p.enabled ? '✅' : '❌'}`).join('\n');
  
  ctx.reply(`**Loaded Plugins:**\n\`\`\`\n${pluginList}\`\`\``);
});

bot.command('plugin', async (ctx) => {
  const action = ctx.args[0];
  const pluginName = ctx.args[1];

  if (!action || !pluginName) {
    return ctx.reply('Usage: !plugin <enable|disable|reload> <plugin_name>');
  }

  try {
    switch (action) {
      case 'enable':
        await bot.enablePlugin(pluginName);
        ctx.reply(`✅ Enabled plugin: ${pluginName}`);
        break;
      case 'disable':
        await bot.disablePlugin(pluginName);
        ctx.reply(`❌ Disabled plugin: ${pluginName}`);
        break;
      case 'reload':
        await bot.reloadPlugin(pluginName);
        ctx.reply(`🔄 Reloaded plugin: ${pluginName}`);
        break;
      default:
        ctx.reply('Invalid action. Use: enable, disable, or reload');
    }
  } catch (error) {
    ctx.reply(`❌ Error: ${error.message}`);
  }
});
```

## Best Practices

1. **Use descriptive names** and follow naming conventions
2. **Handle errors gracefully** in plugin methods
3. **Clean up resources** in the onUnload method
4. **Document your plugin** with clear README files
5. **Use semantic versioning** for plugin versions
6. **Test plugin compatibility** with different bot configurations
7. **Provide configuration options** for flexibility
8. **Use the plugin API** for inter-plugin communication
9. **Follow security best practices** when handling user data
10. **Keep plugins focused** on a single responsibility#
# Next Steps

Take your plugin development further:

1. 📚 [Plugin API Reference](./api-reference.md) - Master the complete plugin API
2. 🏗️ [Built-in Plugins](./built-in-plugins.md) - Learn from existing plugins
3. 📝 [Plugin Examples](../examples/plugins.md) - See real-world implementations
4. 🚀 [Advanced Use Cases](../examples/advanced.md) - Build sophisticated plugin systems






