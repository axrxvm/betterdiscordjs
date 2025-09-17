# Bot Class

The `Bot` class is the heart of @axrxvm/betterdiscordjs. It extends Discord.js functionality with additional features like command handling, plugin management, and advanced utilities.

## Constructor

```javascript
const bot = new Bot(token, options);
```

### Parameters

- `token` (string): Your Discord bot token
- `options` (object): Configuration options

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `commandsDir` | string | `null` | Directory for command files |
| `eventsDir` | string | `null` | Directory for event files |
| `prefix` | string | `"!"` | Default command prefix |
| `slashMode` | string | `'global'` | Slash command mode: 'dev', 'global', 'disabled' |
| `autoRegisterSlash` | boolean | `true` | Auto-register slash commands |
| `devGuild` | string | `null` | Development guild ID |
| `clientId` | string | `null` | Bot client ID |
| `presence` | object | `null` | Initial presence configuration |

## Properties

### Core Properties

```javascript
bot.client          // Discord.js Client instance
bot.commands        // Collection of loaded commands
bot.aliases         // Collection of command aliases
bot.cooldowns       // Collection of command cooldowns
bot.pluginManager   // Plugin management system
```

### Configuration Properties

```javascript
bot.token           // Bot token
bot.prefix          // Command prefix
bot.commandsDir     // Commands directory path
bot.eventsDir       // Events directory path
bot.devGuild        // Development guild ID
bot.clientId        // Bot client ID
```

## Methods

### Command Management

#### `command(name, handler, options)`

Register an inline command:

```javascript
bot.command('hello', async (ctx) => {
  await ctx.reply('Hello, World!');
}, {
  description: 'Say hello',
  slash: true,
  cooldown: '5s'
});
```

**Parameters:**
- `name` (string): Command name
- `handler` (function): Command handler function
- `options` (object): Command options

**Options:**
- `description` (string): Command description
- `slash` (boolean): Enable as slash command
- `cooldown` (string): Cooldown duration
- `permissions` (array): Required permissions
- `guildOnly` (boolean): Guild-only command
- `devOnly` (boolean): Developer-only command

#### `contextMenu(name, type, handler, description)`

Register a context menu command:

```javascript
bot.contextMenu('User Info', 'USER', async (ctx) => {
  const user = ctx.targetUser;
  await ctx.reply(`User: ${user.tag}`);
}, 'Get user information');
```

#### `overload(name, patterns, handler, description)`

Register command overloads for different argument patterns:

```javascript
bot.overload('math', [
  {
    match: (args) => args.length === 3 && args[1] === '+',
    run: async (ctx, args) => {
      const result = parseInt(args[0]) + parseInt(args[2]);
      await ctx.reply(`Result: ${result}`);
    }
  }
], 'Math operations');
```

### Event Management

#### `on(eventName, handler, once)`

Register an event handler:

```javascript
bot.on('messageCreate', async (ctx, message) => {
  if (message.content === 'ping') {
    await message.reply('pong!');
  }
});

// One-time event
bot.on('ready', (ctx) => {
  console.log('Bot is ready!');
}, true);
```

### Plugin Management

#### `use(PluginClass, pluginName)`

Load a plugin using fluent API:

```javascript
bot.use(MyPlugin, 'myplugin');
```

#### `loadPlugin(pluginName)`

Load a plugin from the plugins directory:

```javascript
await bot.loadPlugin('economy');
```

#### `unloadPlugin(pluginName)`

Unload a plugin:

```javascript
await bot.unloadPlugin('economy');
```

#### `reloadPlugin(pluginName)`

Reload a plugin:

```javascript
await bot.reloadPlugin('economy');
```

#### `loadPluginFromClass(PluginClass, pluginName)`

Load a plugin from a class:

```javascript
await bot.loadPluginFromClass(EconomyPlugin, 'economy');
```

#### `getPlugin(pluginName)`

Get a loaded plugin instance:

```javascript
const economyPlugin = bot.getPlugin('economy');
```

#### `listPlugins()`

List all available plugins:

```javascript
const plugins = bot.listPlugins();
console.log(plugins);
```

### Lifecycle Management

#### `start()`

Start the bot:

```javascript
await bot.start();
```

This method:
- Initializes the database
- Loads commands and events
- Registers slash commands
- Logs in to Discord
- Loads plugins

#### `stop()`

Gracefully stop the bot:

```javascript
await bot.stop();
```

### Presence Management

#### `setPresence(presenceObj)`

Set the bot's presence:

```javascript
bot.setPresence({
  activities: [{ name: 'with Discord.js', type: 0 }],
  status: 'online'
});
```

### Scheduling

#### `every(interval, callback)`

Schedule a recurring task:

```javascript
bot.every('30m', () => {
  console.log('Periodic task executed');
});
```

#### `cron(expression, callback)`

Schedule a cron job:

```javascript
bot.cron('0 0 * * *', () => {
  console.log('Daily task at midnight');
});
```

### Queue Management

#### `getQueue(name)`

Get or create a queue:

```javascript
const queue = bot.getQueue('music');
queue.add(() => console.log('Task executed'));
```

### Command Control

#### `setCommandEnabled(guildId, cmdName, enabled)`

Enable/disable commands per guild:

```javascript
bot.setCommandEnabled('123456789', 'admin', false);
```

#### `isCommandEnabled(guildId, cmdName)`

Check if a command is enabled:

```javascript
const enabled = bot.isCommandEnabled('123456789', 'admin');
```

### Prefix Management

#### `setPrefix(guildId, newPrefix)`

Change prefix for a guild:

```javascript
await bot.setPrefix('123456789', '?');
```

### Hot Reloading

#### `reloadCommands()`

Reload all commands:

```javascript
await bot.reloadCommands();
```

#### `reloadEvents()`

Reload all events:

```javascript
await bot.reloadEvents();
```

## Hooks and Middleware

### Command Hooks

#### `onCommandRun(callback)`

Execute before every command:

```javascript
bot.onCommandRun((cmd, ctx) => {
  console.log(`Command ${cmd.name} executed by ${ctx.user.tag}`);
});
```

#### `onCommandError(callback)`

Handle command errors:

```javascript
bot.onCommandError(async (error, cmd, ctx) => {
  console.error(`Error in ${cmd.name}:`, error);
  await ctx.error('Something went wrong!');
});
```

#### `beforeCommand(callback)`

Execute before command execution:

```javascript
bot.beforeCommand(async (cmd, ctx) => {
  console.log(`About to execute ${cmd.name}`);
});
```

#### `afterCommand(callback)`

Execute after command execution:

```javascript
bot.afterCommand(async (cmd, ctx) => {
  console.log(`Finished executing ${cmd.name}`);
});
```

### Event Hooks

#### `beforeEvent(callback)`

Execute before every event:

```javascript
bot.beforeEvent((eventName, ctx, ...args) => {
  console.log(`Event ${eventName} triggered`);
});
```

#### `onAllEvents(callback)`

Handle all events:

```javascript
bot.onAllEvents((ctx, ...args) => {
  // Handle any event
});
```

#### `onAny(callback)`

Wildcard event listener:

```javascript
bot.onAny((eventName, ctx, ...args) => {
  console.log(`Event: ${eventName}`);
});
```

### Error Handling

#### `onError(callback)`

Global error handler:

```javascript
bot.onError((error, cmd, ctx) => {
  console.error('Global error:', error);
});
```

### Inhibitors

#### `addInhibitor(callback)`

Add command inhibitors:

```javascript
bot.addInhibitor((cmd, ctx) => {
  if (ctx.user.id === 'blacklisted_user_id') {
    return 'You are blacklisted!';
  }
  return true; // Allow command
});
```

## Examples

### Basic Bot Setup

```javascript
const { Bot } = require('@axrxvm/betterdiscordjs');

const bot = new Bot(process.env.DISCORD_TOKEN, {
  prefix: '!',
  commandsDir: './commands',
  eventsDir: './events',
  devGuild: process.env.DEV_GUILD,
  clientId: process.env.CLIENT_ID
});

// Add commands
bot.command('ping', async (ctx) => {
  await ctx.reply('Pong!');
});

// Add events
bot.on('ready', (ctx) => {
  console.log(`${ctx.user.tag} is ready!`);
});

// Start bot
bot.start();
```

### Advanced Bot with Plugins

```javascript
const { Bot, plugins } = require('@axrxvm/betterdiscordjs');
const CustomPlugin = require('./plugins/CustomPlugin');

const bot = new Bot(process.env.DISCORD_TOKEN, {
  prefix: '!',
  commandsDir: './commands',
  eventsDir: './events'
})
.use(plugins.WelcomePlugin)
.use(plugins.ModerationPlugin)
.use(CustomPlugin);

// Global hooks
bot.onCommandRun((cmd, ctx) => {
  console.log(`[${ctx.guild?.name || 'DM'}] ${ctx.user.tag}: ${cmd.name}`);
});

bot.onCommandError(async (error, cmd, ctx) => {
  console.error(`Error in ${cmd.name}:`, error.message);
  await ctx.error('An error occurred!');
});

// Inhibitors
bot.addInhibitor((cmd, ctx) => {
  if (process.env.MAINTENANCE && ctx.user.id !== process.env.OWNER_ID) {
    return '🚧 Bot is in maintenance mode.';
  }
  return true;
});

// Scheduling
bot.every('1h', () => {
  console.log('Hourly maintenance check');
});

bot.cron('0 0 * * *', () => {
  console.log('Daily reset at midnight');
});

bot.start();
```

### Dynamic Command Loading

```javascript
const bot = new Bot(process.env.DISCORD_TOKEN);

// Load commands dynamically
const commands = [
  { name: 'hello', handler: (ctx) => ctx.reply('Hello!') },
  { name: 'goodbye', handler: (ctx) => ctx.reply('Goodbye!') }
];

commands.forEach(cmd => {
  bot.command(cmd.name, cmd.handler);
});

bot.start();
```

## Best Practices

### 1. Error Handling

Always implement error handling:

```javascript
bot.onCommandError(async (error, cmd, ctx) => {
  console.error(`Command error: ${error.message}`);
  
  if (!ctx.replied) {
    await ctx.error('Something went wrong!');
  }
});
```

### 2. Graceful Shutdown

Implement graceful shutdown:

```javascript
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await bot.stop();
  process.exit(0);
});
```

### 3. Environment Configuration

Use environment variables:

```javascript
const bot = new Bot(process.env.DISCORD_TOKEN, {
  prefix: process.env.PREFIX || '!',
  devGuild: process.env.DEV_GUILD,
  clientId: process.env.CLIENT_ID
});
```

### 4. Plugin Organization

Organize functionality into plugins:

```javascript
// Instead of many inline commands
bot.command('ban', banHandler);
bot.command('kick', kickHandler);
bot.command('mute', muteHandler);

// Use a moderation plugin
bot.use(ModerationPlugin);
```

## Next Steps

- 📝 Learn about the [Context Object](./context.md)
- 🎯 Explore [Commands](./commands.md)
- 📡 Understand [Events](./events.md)
- 📦 Try the [Plugin System](../plugins/overview.md)

---

The Bot class provides a powerful foundation for building Discord bots with clean, maintainable code.






