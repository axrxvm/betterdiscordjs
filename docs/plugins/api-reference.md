# Plugin API Reference

This document provides a comprehensive reference for the Plugin API in @axrxvm/betterdiscordjs.

## BasePlugin Class

All plugins must extend the `BasePlugin` class which provides the core plugin functionality.

### Constructor

```javascript
constructor(bot, pluginManager)
```

- `bot` - The Bot instance
- `pluginManager` - The PluginManager instance

### Required Properties

Every plugin must define these properties:

```javascript
class MyPlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    this.name = 'myplugin';
    this.version = '1.0.0';
    this.description = 'My awesome plugin';
  }
}
```

### Optional Properties

```javascript
this.dependencies = ['otherplugin']; // Array of required plugins
this.author = 'Your Name';
this.website = 'https://example.com';
this.enabled = true; // Whether plugin is enabled by default
```

### Lifecycle Methods

#### onLoad()

Called when the plugin is loaded. Use this for initialization.

```javascript
async onLoad() {
  this.logger.info(`${this.name} plugin loaded`);
  // Initialize your plugin here
}
```

#### onUnload()

Called when the plugin is unloaded. Use this for cleanup.

```javascript
async onUnload() {
  this.logger.info(`${this.name} plugin unloaded`);
  // Cleanup resources here
}
```

#### onEnable()

Called when the plugin is enabled.

```javascript
async onEnable() {
  this.logger.info(`${this.name} plugin enabled`);
}
```

#### onDisable()

Called when the plugin is disabled.

```javascript
async onDisable() {
  this.logger.info(`${this.name} plugin disabled`);
}
```

### Available Properties

#### this.bot

Access to the main Bot instance.

```javascript
this.bot.client // Discord.js client
this.bot.commands // Command collection
```

#### this.logger

Plugin-specific logger.

```javascript
this.logger.info('Info message');
this.logger.warn('Warning message');
this.logger.error('Error message');
```

#### this.config

Plugin configuration object.

```javascript
// Get config value
const value = this.config.get('key', 'defaultValue');

// Set config value
this.config.set('key', 'value');

// Save config
await this.config.save();
```

### Helper Methods

#### registerCommand(name, handler, options)

Register a command from within the plugin.

```javascript
this.registerCommand('mycommand', async (ctx) => {
  await ctx.reply('Hello from plugin!');
}, {
  description: 'My plugin command',
  cooldown: '5s'
});
```

#### registerEvent(eventName, handler)

Register an event listener from within the plugin.

```javascript
this.registerEvent('messageCreate', async (ctx) => {
  // Handle message
});
```

#### unregisterCommand(name)

Remove a command registered by this plugin.

```javascript
this.unregisterCommand('mycommand');
```

#### unregisterEvent(eventName, handler)

Remove an event listener registered by this plugin.

```javascript
this.unregisterEvent('messageCreate', this.myHandler);
```

## Plugin Configuration

### Config File Structure

Plugin configurations are stored in `plugins/config.json`:

```json
{
  "pluginName": {
    "enabled": true,
    "settings": {
      "key": "value"
    }
  }
}
```

### Accessing Configuration

```javascript
// In your plugin
const setting = this.config.get('settings.key');
this.config.set('settings.newKey', 'newValue');
await this.config.save();
```

## Plugin Manager API

### Loading Plugins

```javascript
// Load a plugin
await bot.loadPlugin('pluginName');

// Load plugin from class
await bot.loadPluginFromClass(MyPluginClass, 'customName');

// Use plugin (fluent API)
bot.use(MyPluginClass).start();
```

### Managing Plugins

```javascript
// Enable/disable
await bot.enablePlugin('pluginName');
await bot.disablePlugin('pluginName');

// Reload
await bot.reloadPlugin('pluginName');

// Unload
await bot.unloadPlugin('pluginName');

// Get plugin instance
const plugin = bot.getPlugin('pluginName');

// List all plugins
const plugins = bot.listPlugins();
```

## Plugin Events

Plugins can listen to special plugin events:

### pluginLoaded

Fired when any plugin is loaded.

```javascript
this.bot.on('pluginLoaded', (pluginName) => {
  this.logger.info(`Plugin ${pluginName} was loaded`);
});
```

### pluginUnloaded

Fired when any plugin is unloaded.

```javascript
this.bot.on('pluginUnloaded', (pluginName) => {
  this.logger.info(`Plugin ${pluginName} was unloaded`);
});
```

## Error Handling

### Plugin Error Events

```javascript
this.bot.on('pluginError', (pluginName, error) => {
  this.logger.error(`Plugin ${pluginName} error:`, error);
});
```

### Try-Catch in Plugin Methods

```javascript
async onLoad() {
  try {
    // Plugin initialization
  } catch (error) {
    this.logger.error('Failed to initialize plugin:', error);
    throw error; // Re-throw to prevent loading
  }
}
```

## Best Practices

1. **Always call super() in constructor**
2. **Handle errors gracefully in lifecycle methods**
3. **Clean up resources in onUnload()**
4. **Use plugin-specific logger for debugging**
5. **Validate dependencies in onLoad()**
6. **Use meaningful plugin names and versions**
7. **Document your plugin's configuration options**

## Example Plugin

```javascript
const { BasePlugin } = require('@axrxvm/betterdiscordjs');

class ExamplePlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    this.name = 'example';
    this.version = '1.0.0';
    this.description = 'An example plugin';
    this.author = 'Your Name';
  }

  async onLoad() {
    this.logger.info('Example plugin loading...');
    
    // Register commands
    this.registerCommand('hello', this.helloCommand.bind(this), {
      description: 'Say hello',
      cooldown: '3s'
    });

    // Register events
    this.registerEvent('messageCreate', this.onMessage.bind(this));
  }

  async onUnload() {
    this.logger.info('Example plugin unloading...');
    // Cleanup if needed
  }

  async helloCommand(ctx) {
    await ctx.reply('Hello from Example Plugin!');
  }

  async onMessage(ctx) {
    if (ctx.raw.content.includes('example')) {
      await ctx.react('👋');
    }
  }
}

module.exports = ExamplePlugin;
```
## Next Steps

Apply your plugin API knowledge:

1. 🔌 [Creating Plugins](./creating-plugins.md) - Start building your first plugin
2. 📝 [Plugin Examples](../examples/plugins.md) - Study real-world implementations
3. 🏗️ [Built-in Plugins](./built-in-plugins.md) - Extend existing functionality
4. 🚀 [Advanced Use Cases](../examples/advanced.md) - Build enterprise-grade plugin systems






