# Bot Class API

The Bot class is the core of @axrxvm/betterdiscordjs, providing a simplified interface for creating Discord bots with advanced features.

## Constructor

### new Bot(token, options)

Creates a new Bot instance.

**Parameters:**
- `token` (string) - Discord bot token
- `options` (object, optional) - Bot configuration options

**Options:**
- `commandsDir` (string) - Directory containing command files
- `eventsDir` (string) - Directory containing event files
- `devGuild` (string) - Development guild ID for testing
- `clientId` (string) - Bot's client ID for slash commands
- `prefix` (string) - Default command prefix (default: "!")
- `slashMode` (string) - Slash command mode: 'dev', 'global' (default: 'global')
- `autoRegisterSlash` (boolean) - Auto-register slash commands (default: true)
- `presence` (object) - Initial bot presence

**Example:**
```javascript
const bot = new Bot(process.env.DISCORD_TOKEN, {
  prefix: '!',
  commandsDir: './commands',
  eventsDir: './events',
  devGuild: '123456789012345678',
  clientId: '987654321098765432'
});
```

## Properties

### bot.client
- **Type:** `Discord.Client`
- **Description:** The underlying Discord.js client instance

### bot.commands
- **Type:** `Discord.Collection`
- **Description:** Collection of registered commands

### bot.aliases
- **Type:** `Discord.Collection`
- **Description:** Collection of command aliases

### bot.cooldowns
- **Type:** `Discord.Collection`
- **Description:** Collection of active command cooldowns

### bot.pluginManager
- **Type:** `PluginManager`
- **Description:** Plugin management system

### bot.prefix
- **Type:** `string`
- **Description:** Current command prefix

## Methods

### Command Registration

#### bot.command(name, handler, options)

Register a command with the bot.

**Parameters:**
- `name` (string) - Command name
- `handler` (function) - Command handler function
- `options` (object, optional) - Command options

**Options:**
- `description` (string) - Command description
- `aliases` (string[]) - Command aliases
- `cooldown` (string) - Cooldown duration (e.g., '5s', '1m')
- `permissions` (string[]) - Required user permissions
- `botPermissions` (string[]) - Required bot permissions
- `guildOnly` (boolean) - Guild-only command
- `devOnly` (boolean) - Developer-only command
- `nsfwOnly` (boolean) - NSFW-only command
- `slash` (boolean) - Enable as slash command
- `options` (object[]) - Slash command options
- `before` (function) - Pre-execution middleware
- `after` (function) - Post-execution middleware
- `onError` (function) - Error handler

**Example:**
```javascript
bot.command('ping', async (ctx) => {
  await ctx.reply('Pong!');
}, {
  description: 'Check bot latency',
  cooldown: '3s',
  slash: true
});
```

#### bot.contextMenu(name, type, handler, description)

Register a context menu command.

**Parameters:**
- `name` (string) - Context menu name
- `type` (number) - Context menu type (1 = USER, 2 = MESSAGE)
- `handler` (function) - Handler function
- `description` (string) - Description

**Example:**
```javascript
bot.contextMenu('User Info', 1, async (ctx) => {
  const target = ctx.raw.targetUser;
  await ctx.reply(`User: ${target.tag}`);
}, 'Get user information');
```

#### bot.overload(name, patterns, handler, description)

Register command overloads with pattern matching.

**Parameters:**
- `name` (string) - Command name
- `patterns` (object[]) - Pattern matching rules
- `handler` (function) - Handler function
- `description` (string) - Description

### Event Registration

#### bot.on(eventName, handler, once)

Register an event handler.

**Parameters:**
- `eventName` (string) - Discord event name
- `handler` (function) - Event handler function
- `once` (boolean, optional) - One-time handler

**Example:**
```javascript
bot.on('messageCreate', async (ctx) => {
  if (ctx.raw.content === 'hello') {
    await ctx.reply('Hello there!');
  }
});
```

### Middleware and Hooks

#### bot.beforeCommand(handler)

Register global before-command middleware.

**Parameters:**
- `handler` (function) - Middleware function

**Example:**
```javascript
bot.beforeCommand(async (cmd, ctx) => {
  console.log(`Executing: ${cmd.name}`);
  return true; // Allow execution
});
```

#### bot.afterCommand(handler)

Register global after-command middleware.

**Parameters:**
- `handler` (function) - Middleware function

#### bot.onCommandRun(handler)

Register command execution hook.

#### bot.onCommandError(handler)

Register command error hook.

**Example:**
```javascript
bot.onCommandError(async (error, cmd, ctx) => {
  console.error(`Command ${cmd.name} failed:`, error);
  await ctx.error('Something went wrong!');
});
```

#### bot.beforeEvent(handler)

Register global event middleware.

#### bot.onAllEvents(handler)

Register handler for all events.

#### bot.onError(handler)

Register global error handler.

### Plugin Management

#### bot.loadPlugin(pluginName)

Load a plugin by name.

**Parameters:**
- `pluginName` (string) - Plugin name

**Returns:** `Promise<Plugin>`

#### bot.unloadPlugin(pluginName)

Unload a plugin.

**Parameters:**
- `pluginName` (string) - Plugin name

**Returns:** `Promise<void>`

#### bot.reloadPlugin(pluginName)

Reload a plugin.

**Parameters:**
- `pluginName` (string) - Plugin name

**Returns:** `Promise<Plugin>`

#### bot.enablePlugin(pluginName)

Enable a plugin.

#### bot.disablePlugin(pluginName)

Disable a plugin.

#### bot.getPlugin(pluginName)

Get a plugin instance.

**Returns:** `Plugin | undefined`

#### bot.listPlugins()

List all loaded plugins.

**Returns:** `Plugin[]`

#### bot.loadPluginFromClass(PluginClass, pluginName)

Load a plugin from a class.

**Parameters:**
- `PluginClass` (class) - Plugin class
- `pluginName` (string, optional) - Custom plugin name

#### bot.use(PluginClass, pluginName)

Fluent API for loading plugins.

**Example:**
```javascript
bot.use(MyPlugin).use(AnotherPlugin).start();
```

### Utility Methods

#### bot.setPresence(presenceObj)

Set bot presence/status.

**Parameters:**
- `presenceObj` (object) - Discord.js presence object

**Example:**
```javascript
bot.setPresence({
  status: 'online',
  activities: [{
    name: 'with Discord.js',
    type: 'PLAYING'
  }]
});
```

#### bot.setPrefix(guildId, newPrefix)

Set guild-specific prefix.

**Parameters:**
- `guildId` (string) - Guild ID
- `newPrefix` (string) - New prefix

#### bot.setCommandEnabled(guildId, cmdName, enabled)

Enable/disable command per guild.

#### bot.isCommandEnabled(guildId, cmdName)

Check if command is enabled in guild.

#### bot.addInhibitor(fn)

Add command inhibitor.

**Parameters:**
- `fn` (function) - Inhibitor function

**Example:**
```javascript
bot.addInhibitor(async (cmd, ctx) => {
  if (ctx.user.id === 'BANNED_USER_ID') {
    await ctx.error('You are banned!');
    return false; // Block command
  }
  return true; // Allow command
});
```

### Scheduling

#### bot.every(interval, fn)

Schedule recurring task.

**Parameters:**
- `interval` (string|number) - Interval (e.g., '5m', 30000)
- `fn` (function) - Task function

**Returns:** `number` - Interval ID

#### bot.cron(expr, fn)

Schedule cron job.

**Parameters:**
- `expr` (string) - Cron expression
- `fn` (function) - Task function

**Returns:** `object` - Cron job

#### bot.getQueue(name)

Get task queue.

**Parameters:**
- `name` (string, optional) - Queue name (default: 'default')

**Returns:** `Queue`

### Hot Reload

#### bot.reloadCommands()

Hot-reload all commands.

**Returns:** `Promise<void>`

#### bot.reloadEvents()

Hot-reload all events.

**Returns:** `Promise<void>`

### Lifecycle

#### bot.start()

Start the bot.

**Returns:** `Promise<void>`

**Example:**
```javascript
await bot.start();
console.log('Bot is running!');
```

#### bot.stop()

Stop the bot gracefully.

**Returns:** `Promise<void>`

## Events

The Bot class emits various events you can listen to:

### 'commandRun'
Emitted when a command is executed.

### 'commandError'
Emitted when a command fails.

### 'pluginLoaded'
Emitted when a plugin is loaded.

### 'pluginUnloaded'
Emitted when a plugin is unloaded.

### 'pluginError'
Emitted when a plugin encounters an error.

**Example:**
```javascript
bot.on('commandRun', (cmd, ctx) => {
  console.log(`Command ${cmd.name} executed by ${ctx.user.tag}`);
});
```

## Advanced Configuration

### Custom Client Options

```javascript
const bot = new Bot(token, {
  clientOptions: {
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Message, Partials.Channel]
  }
});
```

### Environment Variables

The Bot class automatically reads these environment variables:

- `DISCORD_TOKEN` - Bot token (if not provided in constructor)
- `CLIENT_ID` - Bot client ID
- `BOT_OWNER_ID` - Bot owner user ID
- `BOT_LOG_CHANNEL` - Error logging channel ID

### Error Handling

```javascript
// Global error handling
bot.onError((error) => {
  console.error('Bot error:', error);
});

// Command error handling
bot.onCommandError(async (error, cmd, ctx) => {
  console.error(`Command ${cmd.name} error:`, error);
  
  if (!ctx.replied) {
    await ctx.error('An error occurred!');
  }
});

// Uncaught exception handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  bot.stop().then(() => process.exit(1));
});
```

## Best Practices

1. **Always handle errors gracefully**
2. **Use environment variables for sensitive data**
3. **Implement proper logging**
4. **Use middleware for common functionality**
5. **Clean up resources on shutdown**
6. **Use plugins for modular functionality**
7. **Test commands in development guild first**
##
 Next Steps

Master the Bot class and expand your knowledge:

1. 🎯 [Context API](./context.md) - Understand the powerful context object
2. 🔧 [Utilities API](./utilities.md) - Explore built-in utility functions
3. 🔌 [Plugin API](./plugin.md) - Build modular bot features
4. 📋 [Best Practices](../deployment/best-practices.md) - Follow production guidelines






