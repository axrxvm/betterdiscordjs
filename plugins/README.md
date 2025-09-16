# Plugin System

The BetterDJS plugin system allows you to easily add or remove features from your bot without modifying the core code. You can load plugins from files or directly from code.

## Features

- **Hot Loading/Unloading**: Load and unload plugins without restarting the bot
- **Code-based Loading**: Load plugins directly from JavaScript classes
- **Dependency Management**: Plugins can depend on other plugins
- **Configuration System**: Each plugin can have its own configuration
- **Database Integration**: Plugins get scoped database access
- **Event System**: Plugins can register event listeners and hooks
- **Command Registration**: Plugins can add commands with full feature support
- **Fluent API**: Chain plugin loading with `.use()` method

## Loading Plugins from Code

### Method 1: Using .use() (Recommended)

```javascript
const { Bot, plugins } = require('better-djs');

const bot = new Bot(process.env.DISCORD_TOKEN)
  .use(plugins.WelcomePlugin)
  .use(plugins.ModerationPlugin)
  .use(plugins.AutoModPlugin);

bot.start();
```

### Method 2: Load after bot creation

```javascript
const { Bot, plugins } = require('better-djs');

const bot = new Bot(process.env.DISCORD_TOKEN);

// Load plugins programmatically
await bot.loadPluginFromClass(plugins.WelcomePlugin);
await bot.loadPluginFromClass(plugins.ModerationPlugin);

bot.start();
```

### Method 3: Custom inline plugins

```javascript
const { Bot, BasePlugin } = require('better-djs');

class MyPlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    
    this.name = "my-plugin";
    this.version = "1.0.0";
    this.description = "My custom plugin";
  }

  async onLoad() {
    this.addCommand('hello', (ctx) => {
      ctx.reply('Hello from my plugin!');
    });
  }
}

const bot = new Bot(process.env.DISCORD_TOKEN)
  .use(MyPlugin);

bot.start();
```

## Plugin Management Methods

The Bot class provides several methods for managing plugins:

```javascript
// Load a plugin
await bot.loadPlugin('welcome');
await bot.loadPluginFromClass(MyPluginClass);

// Unload a plugin
await bot.unloadPlugin('welcome');

// Reload a plugin
await bot.reloadPlugin('welcome');

// Enable/disable plugins
await bot.enablePlugin('welcome');
await bot.disablePlugin('welcome');

// Get plugin instance
const plugin = bot.getPlugin('welcome');

// List all plugins
const plugins = bot.listPlugins();
```

## Built-in Plugins

### WelcomePlugin
Sends welcome messages to new guild members.

**Commands:**
- `setwelcome <channel> [message]` - Set welcome channel and custom message
- `welcometest` - Test the welcome message

**Placeholders:**
- `{user}` - User mention
- `{username}` - Username
- `{guild}` - Guild name
- `{memberCount}` - Member count

### ModerationPlugin
Basic moderation commands for server management.

**Commands:**
- `kick <user> [reason]` - Kick a member
- `ban <user> [reason]` - Ban a member
- `timeout <user> <duration> [reason]` - Timeout a member
- `purge <amount>` - Delete multiple messages
- `warn <user> <reason>` - Warn a member
- `warnings <user>` - View member warnings

### AutoModPlugin
Automatic moderation with spam detection and word filtering.

**Commands:**
- `automod <setting> [value]` - Configure automod settings
- `filter <add|remove|list> [word]` - Manage word filters

**Features:**
- Spam detection
- Word filtering
- Excessive caps detection
- Mention spam protection

## Creating Custom Plugins

### Basic Plugin Structure

```javascript
const { BasePlugin } = require('better-djs');

class MyPlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    
    // Plugin metadata
    this.name = "my-plugin";
    this.version = "1.0.0";
    this.description = "My awesome plugin";
    this.author = "Your Name";
    this.dependencies = []; // Other plugins this depends on
  }

  async onLoad() {
    this.log("Loading My Plugin...");
    
    // Register commands
    this.addCommand('mycommand', this.myCommand.bind(this), {
      description: 'My custom command',
      permissions: ['SendMessages'],
      cooldown: '5s'
    });

    // Register events
    this.addEvent('messageCreate', this.onMessage.bind(this));
    
    // Add scheduled tasks
    this.addInterval(() => {
      this.log("Periodic task running...");
    }, 60000); // Every minute
    
    // Add cron jobs
    this.addCron('0 0 * * *', () => {
      this.log("Daily task running...");
    });
    
    this.log("My Plugin loaded successfully!");
  }

  async onUnload() {
    this.log("Unloading My Plugin...");
    // Cleanup is handled automatically by BasePlugin
  }

  async myCommand(ctx) {
    ctx.reply("Hello from my plugin!");
  }

  async onMessage(message) {
    if (message.content === 'ping') {
      message.reply('Pong from my plugin!');
    }
  }
}

module.exports = MyPlugin;
```

### Plugin Features

#### Commands
```javascript
this.addCommand('commandname', handler, {
  description: 'Command description',
  permissions: ['ManageMessages'],
  cooldown: '5s',
  guildOnly: true,
  nsfwOnly: false,
  devOnly: false,
  aliases: ['cmd', 'c']
});
```

#### Events
```javascript
this.addEvent('messageCreate', handler);
this.addEvent('guildMemberAdd', handler, true); // once = true
```

#### Scheduled Tasks
```javascript
// Interval (milliseconds)
this.addInterval(callback, 60000);

// Cron expression
this.addCron('0 0 * * *', callback);
```

#### Configuration
```javascript
// Get/set plugin config
const value = this.getConfig('setting', 'default');
this.setConfig('setting', 'value');

// Get/set guild-specific config
const guildValue = await this.getGuildConfig(guildId, 'setting', 'default');
await this.setGuildConfig(guildId, 'setting', 'value');
```

#### Database
```javascript
const db = this.getDB();
db.set('key', 'value');
const value = db.get('key');
```

#### Hooks
```javascript
// Register a hook for other plugins
this.addHook('myHook', (data) => {
  return processData(data);
});

// Call a hook from another plugin
const result = await this.callHook('otherPlugin', 'hookName', data);
```

## File-based Plugins

You can still create plugins as files in the `plugins/` directory:

```
plugins/
├── my-plugin/
│   ├── index.js          # Main plugin file
│   ├── package.json      # Optional: plugin metadata
│   └── README.md         # Optional: plugin documentation
└── config.json           # Plugin configuration
```

File-based plugins are loaded automatically when the bot starts, based on the `config.json` file.

## Plugin Configuration

The `plugins/config.json` file controls which file-based plugins are enabled:

```json
{
  "welcome": {
    "enabled": true,
    "loadedAt": "2024-01-01T00:00:00.000Z"
  },
  "moderation": {
    "enabled": true,
    "loadedAt": "2024-01-01T00:00:00.000Z"
  },
  "automod": {
    "enabled": false
  }
}
```

Plugins loaded from code are automatically added to this configuration with `loadedFromCode: true`.

## Best Practices

1. **Use descriptive names**: Plugin names should be clear and unique
2. **Handle errors gracefully**: Wrap plugin code in try-catch blocks
3. **Clean up resources**: Use the `onUnload()` method to clean up
4. **Document your plugins**: Include clear descriptions and usage examples
5. **Test dependencies**: Ensure required plugins are loaded before yours
6. **Use scoped database keys**: The plugin system provides scoped database access
7. **Log important events**: Use `this.log()` for plugin-specific logging

## Examples

Check the `examples/` directory for complete working examples of how to use the plugin system in different scenarios.