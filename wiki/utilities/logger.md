# Logger Utility

The logger utility provides colored console logging for @axrxvm/betterdiscordjs applications.

## Overview

The logger uses chalk for colored output and provides three logging levels: info, warn, and error.

## Usage

```javascript
const { logger } = require('@axrxvm/betterdiscordjs');

// Or import directly
const logger = require('@axrxvm/betterdiscordjs/utils/logger');
```

## Methods

### info(message)

Logs an informational message in blue.

```javascript
logger.info('Bot started successfully');
logger.info(`Loaded ${commands.size} commands`);
```

**Output:**
```
[INFO] Bot started successfully
[INFO] Loaded 5 commands
```

### warn(message)

Logs a warning message in yellow.

```javascript
logger.warn('Configuration file not found, using defaults');
logger.warn(`Command ${cmdName} is deprecated`);
```

**Output:**
```
[WARN] Configuration file not found, using defaults
[WARN] Command ping is deprecated
```

### error(message)

Logs an error message in red.

```javascript
logger.error('Failed to connect to database');
logger.error(`Command execution failed: ${error.message}`);
```

**Output:**
```
[ERROR] Failed to connect to database
[ERROR] Command execution failed: Permission denied
```

## Examples

### Basic Logging

```javascript
const { Bot, logger } = require('@axrxvm/betterdiscordjs');

const bot = new Bot(process.env.DISCORD_TOKEN);

bot.on('ready', (ctx) => {
  logger.info(`✅ Logged in as ${ctx.client.user.tag}`);
});

bot.command('test', async (ctx) => {
  logger.info(`Command 'test' executed by ${ctx.user.tag}`);
  await ctx.reply('Test successful!');
});

bot.start();
```

### Error Handling with Logger

```javascript
bot.onCommandError(async (error, cmd, ctx) => {
  logger.error(`Command ${cmd.name} failed: ${error.message}`);
  await ctx.error('Something went wrong!');
});

bot.onError((error) => {
  logger.error(`Bot error: ${error.stack}`);
});
```

### Plugin Logging

```javascript
class MyPlugin extends BasePlugin {
  async onLoad() {
    logger.info(`Loading plugin: ${this.name}`);
    // Plugin initialization
  }

  async onError(error) {
    logger.error(`Plugin ${this.name} error: ${error.message}`);
  }
}
```

### Conditional Logging

```javascript
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  logger.info('Debug mode enabled');
}

// Log command usage statistics
bot.afterCommand(async (cmd, ctx) => {
  if (DEBUG) {
    logger.info(`Command stats: ${cmd.name} used by ${ctx.user.tag}`);
  }
});
```

## Best Practices

1. **Use appropriate log levels**
   - `info` for general information and successful operations
   - `warn` for potential issues that don't break functionality
   - `error` for actual errors and failures

2. **Include context in messages**
   ```javascript
   // Good
   logger.error(`Failed to load command ${fileName}: ${error.message}`);
   
   // Less helpful
   logger.error('Command load failed');
   ```

3. **Log important bot lifecycle events**
   ```javascript
   logger.info('Bot starting...');
   logger.info(`Loaded ${commands.size} commands`);
   logger.info(`Connected to ${guilds.size} guilds`);
   ```

4. **Don't log sensitive information**
   ```javascript
   // Bad
   logger.info(`Token: ${process.env.DISCORD_TOKEN}`);
   
   // Good
   logger.info('Bot authenticated successfully');
   ```

## Integration with Bot Events

The logger is automatically used by the Bot class for internal logging:

```javascript
// These are logged automatically
✅ Logged in as BotName#1234
Commands loaded: 5
Events loaded: 3
✅ Plugin system initialized with 2 plugins
```

## Environment-Based Logging

You can implement different logging levels based on environment:

```javascript
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const customLogger = {
  info: (msg) => {
    if (['info', 'warn', 'error'].includes(LOG_LEVEL)) {
      logger.info(msg);
    }
  },
  warn: (msg) => {
    if (['warn', 'error'].includes(LOG_LEVEL)) {
      logger.warn(msg);
    }
  },
  error: (msg) => {
    if (LOG_LEVEL === 'error') {
      logger.error(msg);
    }
  }
};
```

## Colors Reference

The logger uses these colors by default:
- **Blue** - Info messages
- **Yellow** - Warning messages  
- **Red** - Error messages

These colors are provided by the chalk library and will work in most modern terminals.## Ne
xt Steps

Enhance your bot's logging capabilities:

1. 🚦 [Rate Limiting](./rate-limiting.md) - Prevent spam and abuse
2. 📅 [Scheduler](./scheduler.md) - Automate logging and maintenance tasks
3. 📋 [Best Practices](../deployment/best-practices.md) - Follow production logging guidelines
4. 🔧 [Bot Class API](../api/bot.md) - Integrate logging with bot features






