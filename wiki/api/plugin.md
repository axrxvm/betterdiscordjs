# Plugin API

The Plugin API provides the foundation for creating modular extensions for @axrxvm/betterdiscordjs bots. All plugins must extend the BasePlugin class.

## BasePlugin Class

### Constructor

#### new BasePlugin(bot, pluginManager)

Creates a new plugin instance.

**Parameters:**
- `bot` (Bot) - The bot instance
- `pluginManager` (PluginManager) - The plugin manager instance

**Example:**
```javascript
const { BasePlugin } = require('@axrxvm/betterdiscordjs');

class MyPlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    this.name = 'myplugin';
    this.version = '1.0.0';
    this.description = 'My awesome plugin';
  }
}
```

## Required Properties

### plugin.name
- **Type:** `string`
- **Description:** Unique plugin identifier
- **Required:** Yes

### plugin.version
- **Type:** `string`
- **Description:** Plugin version (semantic versioning recommended)
- **Required:** Yes

## Optional Properties

### plugin.description
- **Type:** `string`
- **Description:** Plugin description

### plugin.author
- **Type:** `string`
- **Description:** Plugin author name

### plugin.website
- **Type:** `string`
- **Description:** Plugin website or repository URL

### plugin.dependencies
- **Type:** `string[]`
- **Description:** Array of required plugin names

### plugin.enabled
- **Type:** `boolean`
- **Description:** Whether plugin is enabled (default: true)

## Available Properties

### plugin.bot
- **Type:** `Bot`
- **Description:** Access to the main bot instance

### plugin.logger
- **Type:** `object`
- **Description:** Plugin-specific logger with info, warn, error methods

### plugin.config
- **Type:** `object`
- **Description:** Plugin configuration manager

## Lifecycle Methods

### plugin.onLoad()

Called when the plugin is loaded. Use for initialization.

**Returns:** `Promise<void>`

**Example:**
```javascript
async onLoad() {
  this.logger.info(`${this.name} plugin loading...`);
  
  // Initialize plugin resources
  this.data = new Map();
  
  // Register commands
  this.registerCommand('mycommand', this.myCommandHandler.bind(this), {
    description: 'My plugin command'
  });
  
  // Register events
  this.registerEvent('messageCreate', this.onMessage.bind(this));
  
  this.logger.info(`${this.name} plugin loaded successfully`);
}
```

### plugin.onUnload()

Called when the plugin is unloaded. Use for cleanup.

**Returns:** `Promise<void>`

**Example:**
```javascript
async onUnload() {
  this.logger.info(`${this.name} plugin unloading...`);
  
  // Cleanup resources
  if (this.interval) {
    clearInterval(this.interval);
  }
  
  // Close connections
  if (this.connection) {
    await this.connection.close();
  }
  
  this.logger.info(`${this.name} plugin unloaded`);
}
```

### plugin.onEnable()

Called when the plugin is enabled.

**Returns:** `Promise<void>`

### plugin.onDisable()

Called when the plugin is disabled.

**Returns:** `Promise<void>`

### plugin.onReload()

Called when the plugin is reloaded.

**Returns:** `Promise<void>`

## Command Registration

### plugin.registerCommand(name, handler, options)

Register a command from within the plugin.

**Parameters:**
- `name` (string) - Command name
- `handler` (function) - Command handler function
- `options` (object, optional) - Command options

**Example:**
```javascript
this.registerCommand('weather', async (ctx) => {
  const location = ctx.args.join(' ');
  const weather = await this.getWeather(location);
  await ctx.reply(`Weather in ${location}: ${weather}`);
}, {
  description: 'Get weather information',
  cooldown: '30s',
  options: [{
    name: 'location',
    description: 'Location to get weather for',
    type: 3,
    required: true
  }],
  slash: true
});
```

### plugin.unregisterCommand(name)

Remove a command registered by this plugin.

**Parameters:**
- `name` (string) - Command name to remove

## Event Registration

### plugin.registerEvent(eventName, handler)

Register an event listener from within the plugin.

**Parameters:**
- `eventName` (string) - Discord event name
- `handler` (function) - Event handler function

**Example:**
```javascript
this.registerEvent('guildMemberAdd', async (ctx) => {
  const member = ctx.raw;
  const welcomeChannel = member.guild.channels.cache.find(ch => ch.name === 'welcome');
  
  if (welcomeChannel) {
    await welcomeChannel.send(`Welcome ${member.user.tag}!`);
  }
});
```

### plugin.unregisterEvent(eventName, handler)

Remove an event listener registered by this plugin.

**Parameters:**
- `eventName` (string) - Event name
- `handler` (function) - Handler function to remove

## Configuration Management

### plugin.config.get(key, defaultValue)

Get a configuration value.

**Parameters:**
- `key` (string) - Configuration key
- `defaultValue` (any, optional) - Default value if key doesn't exist

**Returns:** `any`

**Example:**
```javascript
const apiKey = this.config.get('apiKey', 'default-key');
const settings = this.config.get('settings', {
  enabled: true,
  timeout: 5000
});
```

### plugin.config.set(key, value)

Set a configuration value.

**Parameters:**
- `key` (string) - Configuration key
- `value` (any) - Value to set

**Example:**
```javascript
this.config.set('lastUpdate', Date.now());
this.config.set('userPreferences', {
  theme: 'dark',
  notifications: true
});
```

### plugin.config.save()

Save configuration to disk.

**Returns:** `Promise<void>`

**Example:**
```javascript
this.config.set('newSetting', 'value');
await this.config.save();
```

### plugin.config.delete(key)

Delete a configuration key.

**Parameters:**
- `key` (string) - Key to delete

### plugin.config.has(key)

Check if configuration key exists.

**Parameters:**
- `key` (string) - Key to check

**Returns:** `boolean`

## Plugin Communication

### plugin.getPlugin(name)

Get another plugin instance.

**Parameters:**
- `name` (string) - Plugin name

**Returns:** `BasePlugin | undefined`

**Example:**
```javascript
const economyPlugin = this.getPlugin('economy');
if (economyPlugin) {
  const balance = await economyPlugin.getBalance(userId);
}
```

### plugin.isPluginLoaded(name)

Check if a plugin is loaded.

**Parameters:**
- `name` (string) - Plugin name

**Returns:** `boolean`

### plugin.waitForPlugin(name, timeout)

Wait for a plugin to be loaded.

**Parameters:**
- `name` (string) - Plugin name
- `timeout` (number, optional) - Timeout in milliseconds

**Returns:** `Promise<BasePlugin>`

## Database Integration

### plugin.db

Access to the bot's database system (if available).

**Example:**
```javascript
// Get user data
const userData = await this.bot.db.getUserData(userId);

// Set guild configuration
await this.bot.db.setGuildConfig(guildId, 'pluginSettings', settings);
```

## Scheduling

### plugin.schedule(interval, callback)

Schedule a recurring task.

**Parameters:**
- `interval` (string|number) - Interval (e.g., '5m', 30000)
- `callback` (function) - Function to execute

**Returns:** `number` - Interval ID

**Example:**
```javascript
// Schedule task every 5 minutes
this.schedule('5m', async () => {
  await this.performMaintenance();
});

// Schedule task every 30 seconds
this.schedule(30000, () => {
  this.updateStats();
});
```

### plugin.scheduleOnce(delay, callback)

Schedule a one-time task.

**Parameters:**
- `delay` (string|number) - Delay before execution
- `callback` (function) - Function to execute

**Returns:** `number` - Timeout ID

## Error Handling

### plugin.handleError(error, context)

Handle plugin errors gracefully.

**Parameters:**
- `error` (Error) - The error that occurred
- `context` (string, optional) - Error context

**Example:**
```javascript
async myCommandHandler(ctx) {
  try {
    await this.performRiskyOperation();
  } catch (error) {
    this.handleError(error, 'myCommandHandler');
    await ctx.error('Something went wrong!');
  }
}

handleError(error, context = 'unknown') {
  this.logger.error(`Error in ${context}:`, error);
  
  // Optional: Send to error reporting service
  if (this.config.get('errorReporting', false)) {
    this.reportError(error, context);
  }
}
```

## Plugin Hooks

### plugin.beforeCommand(handler)

Register before-command hook for this plugin.

**Parameters:**
- `handler` (function) - Hook function

### plugin.afterCommand(handler)

Register after-command hook for this plugin.

**Parameters:**
- `handler` (function) - Hook function

## Complete Plugin Example

```javascript
const { BasePlugin } = require('@axrxvm/betterdiscordjs');

class WeatherPlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    this.name = 'weather';
    this.version = '1.2.0';
    this.description = 'Weather information plugin';
    this.author = 'Your Name';
    this.dependencies = ['database'];
    
    this.apiKey = null;
    this.cache = new Map();
  }

  async onLoad() {
    this.logger.info('Loading weather plugin...');
    
    // Load configuration
    this.apiKey = this.config.get('apiKey');
    if (!this.apiKey) {
      throw new Error('Weather API key not configured');
    }
    
    // Register commands
    this.registerCommand('weather', this.weatherCommand.bind(this), {
      description: 'Get weather information',
      options: [{
        name: 'location',
        description: 'Location to get weather for',
        type: 3,
        required: true
      }],
      slash: true,
      cooldown: '30s'
    });
    
    this.registerCommand('forecast', this.forecastCommand.bind(this), {
      description: 'Get weather forecast',
      options: [{
        name: 'location',
        description: 'Location to get forecast for',
        type: 3,
        required: true
      }],
      slash: true,
      cooldown: '1m'
    });
    
    // Schedule cache cleanup every hour
    this.schedule('1h', () => {
      this.cleanupCache();
    });
    
    this.logger.info('Weather plugin loaded successfully');
  }

  async onUnload() {
    this.logger.info('Unloading weather plugin...');
    
    // Clear cache
    this.cache.clear();
    
    this.logger.info('Weather plugin unloaded');
  }

  async weatherCommand(ctx) {
    const location = ctx.getOption('location');
    
    try {
      const weather = await this.getWeather(location);
      
      const embed = ctx.embed()
        .title(`🌤️ Weather in ${weather.location}`)
        .field('Temperature', `${weather.temp}°C`, true)
        .field('Condition', weather.condition, true)
        .field('Humidity', `${weather.humidity}%`, true)
        .field('Wind', `${weather.windSpeed} km/h`, true)
        .color('blue')
        .timestamp();
      
      await embed.send();
      
    } catch (error) {
      this.handleError(error, 'weatherCommand');
      await ctx.error('Failed to get weather information. Please try again.');
    }
  }

  async forecastCommand(ctx) {
    const location = ctx.getOption('location');
    
    try {
      const forecast = await this.getForecast(location);
      
      const embed = ctx.embed()
        .title(`📅 5-Day Forecast for ${forecast.location}`)
        .color('blue');
      
      forecast.days.forEach(day => {
        embed.field(
          day.date,
          `${day.condition}\n${day.high}°C / ${day.low}°C`,
          true
        );
      });
      
      await embed.send();
      
    } catch (error) {
      this.handleError(error, 'forecastCommand');
      await ctx.error('Failed to get weather forecast. Please try again.');
    }
  }

  async getWeather(location) {
    // Check cache first
    const cacheKey = `weather:${location.toLowerCase()}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 600000) { // 10 minutes
        return cached.data;
      }
    }
    
    // Fetch from API
    const response = await fetch(
      `https://api.weather.com/v1/current?location=${encodeURIComponent(location)}&key=${this.apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  }

  async getForecast(location) {
    // Similar implementation to getWeather but for forecast
    // ... implementation details
  }

  cleanupCache() {
    const now = Date.now();
    const maxAge = 3600000; // 1 hour
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }
    
    this.logger.info(`Cache cleanup completed. ${this.cache.size} entries remaining.`);
  }

  handleError(error, context) {
    this.logger.error(`Weather plugin error in ${context}:`, error);
    
    // Increment error counter
    const errorCount = this.config.get('errorCount', 0) + 1;
    this.config.set('errorCount', errorCount);
    this.config.save();
  }
}

module.exports = WeatherPlugin;
```

## Best Practices

1. **Always call super() in constructor**
2. **Handle errors gracefully in all methods**
3. **Clean up resources in onUnload()**
4. **Use plugin-specific logger for debugging**
5. **Validate dependencies in onLoad()**
6. **Use meaningful plugin names and versions**
7. **Document your plugin's configuration options**
8. **Implement proper error handling**
9. **Use caching for expensive operations**
10. **Follow semantic versioning for plugin versions**## Ne
xt Steps

Ready to build amazing plugins?

1. 🔌 [Creating Plugins](../plugins/creating-plugins.md) - Step-by-step plugin development
2. 📚 [Plugin Examples](../examples/plugins.md) - Real-world plugin implementations
3. 🏗️ [Built-in Plugins](../plugins/built-in-plugins.md) - Explore existing plugins
4. 🚀 [Advanced Use Cases](../examples/advanced.md) - Complex plugin architectures






