# Bot Class API

The Bot class is the core of @axrxvm/betterdiscordjs, providing a simplified interface for creating Discord bots with advanced features.

## Constructor

### new Bot(token, options)

Creates a new Bot instance.

**Parameters:**
- `token` (string) - Discord bot token
- `options` (object, optional) - Bot configuration options

**Options:**
- `prefix` (string, optional) - The default command prefix. Defaults to `!`.
- `commandsDir` (string, optional) - The directory containing command files.
- `eventsDir` (string, optional) - The directory containing event files.
- `devGuild` (string, optional) - The developer guild ID for registering slash commands in `dev` mode.
- `clientId` (string, optional) - The bot's client ID, required for slash command registration.
- `slashMode` (string, optional) - The slash command registration mode. Can be `'dev'` (registers in `devGuild` only) or `'global'`. Defaults to `'dev'` if `devGuild` is provided, otherwise `'global'`.
- `autoRegisterSlash` (boolean, optional) - Whether to automatically register slash commands with Discord on startup. Defaults to `true`.
- `presence` (object, optional) - The initial presence object to set when the bot logs in.

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

#### bot.command(name, handler, descriptionOrOptions)

Registers an inline command. This method offers flexibility by allowing the third argument to be either a simple description string or a full options object.

**Parameters:**
- `name` (string) - The name of the command.
- `handler` (function) - The asynchronous function to execute when the command is called. It receives a `Ctx` object as its first argument.
- `descriptionOrOptions` (string | object, optional) - Either a string for the command's description or an object containing detailed options.

**Options Object:**
- `description` (string, optional) - A short description of what the command does.
- `aliases` (string[], optional) - An array of alternative names for the command.
- `cooldown` (string, optional) - A time string (e.g., `'5s'`, `'1m'`) for rate-limiting the command.
- `permissions` (string[], optional) - An array of Discord permissions the user must have to run the command.
- `botPermissions` (string[], optional) - An array of Discord permissions the bot must have.
- `guildOnly` (boolean, optional) - If `true`, the command can only be used in a server.
- `nsfwOnly` (boolean, optional) - If `true`, the command can only be used in an NSFW channel.
- `devOnly` (boolean, optional) - If `true`, the command can only be run by the user ID defined in the `BOT_OWNER_ID` environment variable.
- `slash` (boolean, optional) - If `true`, registers the command as a slash command. Defaults to `false`.
- `options` (object[], optional) - An array of Discord Application Command options for slash commands.
- `before` (function, optional) - A per-command middleware function that runs before execution.
- `after` (function, optional) - A per-command middleware function that runs after successful execution.
- `onError` (function, optional) - A per-command error handler.

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

Registers a context menu command, which appears when a user right-clicks a user or a message.

**Parameters:**
- `name` (string) - The name of the context menu item.
- `type` (ApplicationCommandType) - The type of context menu. It is highly recommended to use the `ApplicationCommandType` enum from `discord.js` (`ApplicationCommandType.User` or `ApplicationCommandType.Message`).
- `handler` (function) - The asynchronous function to execute. It receives a `Ctx` object.
- `description` (string, optional) - A description for the command.

**Example:**
```javascript
const { ApplicationCommandType } = require('discord.js');

bot.contextMenu('Get User Info', ApplicationCommandType.User, async (ctx) => {
  const targetUser = ctx.interaction.targetUser;
  await ctx.reply(`Info for ${targetUser.tag}: ...`);
});

bot.contextMenu('Report Message', ApplicationCommandType.Message, async (ctx) => {
  const targetMessage = ctx.interaction.targetMessage;
  await ctx.reply(`Message "${targetMessage.content}" has been reported.`);
});
```

### Command Management

These methods provide fine-grained control over command behavior.

#### bot.addInhibitor(handler)
Adds a command inhibitor, which is a function that runs before a command to determine if it should be executed.
- `handler` (function: `async (cmd, ctx) => boolean | string`): A function that receives the command and context.
  - Return `true` to allow execution.
  - Return `false` to silently block execution.
  - Return a `string` to block execution and reply with the string.

**Example:**
```javascript
// Block commands for muted users
bot.addInhibitor(async (cmd, ctx) => {
  if (isMuted(ctx.user.id)) {
    return 'You are muted and cannot run commands.';
  }
  return true;
});
```

#### bot.setCommandEnabled(guildId, cmdName, enabled)
Enables or disables a specific command within a single guild.
- `guildId` (string) - The ID of the guild.
- `cmdName` (string) - The name of the command to configure.
- `enabled` (boolean) - `true` to enable, `false` to disable.

#### bot.isCommandEnabled(guildId, cmdName)
Checks if a command is currently enabled in a specific guild.
- `guildId` (string) - The ID of the guild.
- `cmdName` (string) - The name of the command.
- **Returns:** `boolean`

#### bot.setPrefix(guildId, newPrefix)
Sets a custom command prefix for a specific guild, which will be persisted in the database.
- `guildId` (string) - The ID of the guild.
- `newPrefix` (string) - The new prefix to set.
- **Returns:** `Promise<void>`

#### bot.overload(name, patterns, handler, description)
Registers a command with multiple "overloads," where different function signatures are executed based on the arguments provided. This is an advanced feature for complex command parsing.
- `name` (string) - The name of the command.
- `patterns` (object[]) - An array of pattern objects to match against arguments.
- `handler` (function) - The default handler if no patterns match.
- `description` (string, optional) - A description for the command.

### Event Registration

#### bot.on(eventName, handler, once)

Registers an event handler for a Discord.js event. The handler function will receive a `Ctx` object as its first argument, followed by the original event arguments.

**Parameters:**
- `eventName` (string) - The name of the Discord.js event to listen for (e.g., `'messageCreate'`).
- `handler` (function) - The asynchronous function to execute when the event is emitted.
- `once` (boolean, optional) - If `true`, the listener will be removed after its first execution. Defaults to `false`.

**Example:**
```javascript
// The Ctx object is the first argument, followed by original event args
bot.on('messageCreate', async (ctx, message) => {
  // `ctx` is the framework's context object
  // `message` is the original discord.js message object
  if (message.content.toLowerCase() === 'ping') {
    await ctx.reply('Pong!');
  }
});
```

### Middleware and Hooks

The bot provides a powerful hook system to intercept commands and events at various stages.

#### bot.beforeCommand(handler)
Registers a global middleware function that runs before any command is executed.
- `handler` (function: `async (cmd, ctx) => boolean | void`): A function that receives the command object and the context. Returning `false` will prevent the command from running.

#### bot.afterCommand(handler)
Registers a global middleware function that runs after any command has successfully executed.
- `handler` (function: `async (cmd, ctx) => void`): A function that receives the command object and the context.

#### bot.onCommandRun(handler)
Registers a hook that is called just as a command's `run` method is about to be invoked.
- `handler` (function: `async (cmd, ctx) => void`): Receives the command and context.

#### bot.onCommandError(handler)
Registers a global error handler specifically for command execution errors. This is the recommended way to handle command failures.
- `handler` (function: `async (error, cmd, ctx) => void`): Receives the error, the command object, and the context.

**Example:**
```javascript
bot.onCommandError(async (error, cmd, ctx) => {
  console.error(`Error in command '${cmd.name}':`, error);
  if (!ctx.replied) {
    await ctx.reply('A wild error appeared!');
  }
});
```

#### bot.beforeEvent(handler)
Registers a middleware function that runs before any event handler is executed.
- `handler` (function: `async (eventName, ctx, ...args) => void`): Receives the event name, context, and original event arguments.

#### bot.onAllEvents(handler)
Registers a low-level handler that is called for every raw event from the Discord gateway.
- `handler` (function: `(ctx, ...args) => void`): Receives the context and raw event data.

#### bot.onError(handler)
Registers a global handler for any errors that are not caught by other specific handlers (e.g., `onCommandError`).
- `handler` (function: `(error, cmd, ctx) => void`): Receives the error and optionally the command and context if the error originated from a command.

#### bot.onAny(handler)
Registers a wildcard event listener that fires for any processed event, receiving the `Ctx` object.
- `handler` (function: `(eventName, ctx, ...args) => void`): Receives the event name, context, and original event arguments.

### Plugin Management

The bot features a robust plugin system for modularizing and extending functionality. See the [Plugin Overview](../../plugins/overview.md) for more details on creating plugins.

#### bot.use(PluginClass, pluginName)
Registers a plugin class to be loaded when `bot.start()` is called. This is the recommended, chainable method for adding plugins.
- `PluginClass` (class) - The plugin class (not an instance).
- `pluginName` (string, optional) - An optional name for the plugin.
- **Returns:** `Bot` (for chaining).

**Example:**
```javascript
const MyPlugin = require('./plugins/my-plugin');
const AnotherPlugin = require('./plugins/another-plugin');

bot.use(MyPlugin)
   .use(AnotherPlugin)
   .start();
```

#### bot.loadPlugin(pluginName)
Loads a plugin from the configured plugins directory by its name.
- `pluginName` (string) - The name of the plugin file (without the extension).
- **Returns:** `Promise<Plugin>`

#### bot.unloadPlugin(pluginName)
Unloads an active plugin, disabling its commands and events.
- `pluginName` (string) - The name of the plugin to unload.
- **Returns:** `Promise<void>`

#### bot.reloadPlugin(pluginName)
Reloads an active plugin, effectively unloading and then loading it again.
- `pluginName` (string) - The name of the plugin to reload.
- **Returns:** `Promise<Plugin>`

#### bot.enablePlugin(pluginName)
Enables a currently disabled plugin.
- `pluginName` (string) - The name of the plugin.
- **Returns:** `Promise<void>`

#### bot.disablePlugin(pluginName)
Disables an active plugin without unloading it. Its commands and events will cease to function.
- `pluginName` (string) - The name of the plugin.
- **Returns:** `Promise<void>`

#### bot.getPlugin(pluginName)
Retrieves a loaded plugin instance by its name.
- `pluginName` (string) - The name of the plugin.
- **Returns:** `Plugin | undefined` - The plugin instance if found.

#### bot.listPlugins()
Lists all currently loaded plugins.
- **Returns:** `Plugin[]` - An array of loaded plugin instances.

#### bot.loadPluginFromClass(PluginClass, pluginName)
Loads and initializes a plugin directly from its class definition. This is useful for plugins that are not located in the standard plugins directory.
- `PluginClass` (class) - The plugin class definition.
- `pluginName` (string, optional) - An optional name to assign to the plugin.
- **Returns:** `Promise<Plugin>`

### Utility Methods

#### bot.setPresence(presenceObj)
Sets the bot's presence (e.g., status, activity). This can be called at any time.
- `presenceObj` (object) - A standard Discord.js [PresenceData](https://discord.js.org/#/docs/main/stable/typedef/PresenceData) object.

**Example:**
```javascript
bot.setPresence({
  status: 'online',
  activities: [{
    name: 'the chat',
    type: 'WATCHING'
  }]
});
```


### Scheduling

The bot integrates a scheduler for running tasks at specific intervals or times.

#### bot.every(interval, fn)
Schedules a function to run repeatedly at a given interval.
- `interval` (string | number) - The interval, parsed by `ms` (e.g., `'5m'`, `300000`).
- `fn` (function) - The function to execute.
- **Returns**: A task object that can be used to stop the schedule.

#### bot.cron(expr, fn)
Schedules a function to run based on a cron expression.
- `expr` (string) - The cron expression (e.g., `'*/5 * * * *'`).
- `fn` (function) - The function to execute.
- **Returns**: A cron job object.

#### bot.getQueue(name)
Retrieves a named task queue, creating it if it doesn't exist. This is useful for managing sequential asynchronous tasks.
- `name` (string, optional) - The name of the queue. Defaults to `'default'`.
- **Returns**: A `Queue` instance.

### Hot Reload

For a better development experience, you can hot-reload commands and events without restarting the bot.

#### bot.reloadCommands()
Clears all existing commands and reloads them from the `commandsDir`.
- **Returns:** `Promise<void>`

#### bot.reloadEvents()
Removes all event listeners and re-attaches them from the `eventsDir`.
- **Returns:** `Promise<void>`

### Lifecycle

#### bot.start()

Initializes the bot, loads all commands, events, and plugins, and logs into Discord.

**Returns:** `Promise<void>`

**Example:**
```javascript
await bot.start();
console.log('Bot is running!');
```

#### bot.stop()
Gracefully disconnects the bot from Discord.
- **Returns:** `Promise<void>`

## Bot Lifecycle Hooks

Instead of a traditional event system, the bot provides a set of direct hooks for lifecycle events related to commands and plugins. This provides a more direct and predictable way to tap into the bot's core operations.

For handling command execution, please see the [Middleware and Hooks](#middleware-and-hooks) section for methods like `bot.onCommandRun()` and `bot.onCommandError()`.

For listening to Discord gateway events, see the `bot.on()` method in the [Event Registration](#event-registration) section.

The `PluginManager` handles its own events, which can be listened to on the `bot.pluginManager` instance.

## Advanced Configuration

### Custom Client Options

The `Bot` constructor includes a default set of `intents` and `partials` required for basic functionality:
- **Intents**: `Guilds`, `GuildMessages`, `MessageContent`, `GuildMembers`
- **Partials**: `Message`, `Channel`, `Reaction`

You can override these by passing a `clientOptions` object in the constructor. **Note:** If you provide custom `clientOptions`, you must specify all required intents and partials yourself, as the defaults will not be merged.

```javascript
const { GatewayIntentBits, Partials } = require('discord.js');

const bot = new Bot(token, {
  // Add your custom client options here
  clientOptions: {
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      // Add any other intents your bot needs
    ],
    partials: [Partials.Message, Partials.Channel],
    // You can also disable the default partials
    // partials: []
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






