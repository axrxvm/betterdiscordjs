# Using better-djs

Welcome to the `better-djs` framework! This guide will walk you through everything you need to know to build powerful and scalable Discord bots with ease.

## Table of Contents

-   [Introduction](#introduction)
-   [Project Setup](#project-setup)
-   [The `Bot` Class](#the-bot-class)
-   [Command Handling](#command-handling)
    -   [Message Commands](#message-commands)
    -   [Slash Commands](#slash-commands)
    -   [Command Properties](#command-properties)
-   [Event Handling](#event-handling)
-   [The `ctx` Object](#the-ctx-object)
-   [Framework Utilities](#framework-utilities)
    -   [`db.js`](#dbjs)
    -   [`logger.js`](#loggerjs)
    -   [`scheduler.js`](#schedulerjs)
    -   [`queue.js`](#queuejs)
-   [Advanced Features](#advanced-features)
    -   [Inhibitors](#inhibitors)
    -   [Middleware](#middleware)
    -   [Command Overloads](#command-overloads)
    -   [Hot-Reloading](#hot-reloading)
-   [Full Bot Example](#full-bot-example)

## Introduction

`better-djs` is a modern, modular, and extensible Discord bot framework for Node.js. It's designed to provide a robust foundation for bots of all sizes, from small server utilities to large, sharded applications. The framework's philosophy is centered on clean, readable, and easily extensible code.

## Project Setup

1.  **Clone the repository (or use it as a template):**
    ```sh
    git clone https://github.com/your-username/better-djs.git
    cd better-djs
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Create your main bot file:**
    Create a file (e.g., `my-bot.js`) in your project's root directory.

4.  **Set up environment variables:**
    Create a `.env` file in the root of your project and add your bot's token and client ID:
    ```env
    TOKEN=your_bot_token_here
    CLIENT_ID=your_bot_client_id_here
    ```

## The `Bot` Class

The `Bot` class is the heart of the framework. It handles the Discord client, command and event loading, and all core functionalities.

To get started, you need to instantiate the `Bot` class:

```javascript
const { Bot } = require('./better-djs'); // Adjust the path if necessary

const bot = new Bot(process.env.TOKEN, {
  clientId: process.env.CLIENT_ID,
  commandsDir: 'commands', // Directory where your command files are located
  eventsDir: 'events',     // Directory where your event files are located
  prefix: '!',             // Default command prefix
  devGuild: 'your_dev_guild_id_here' // Optional: for testing slash commands
});

bot.start();
```

## Command Handling

`better-djs` supports both traditional message-based commands and modern slash commands.

### Message Commands

To create a message command, create a new file in your `commands` directory (e.g., `ping.js`):

```javascript
// commands/ping.js
module.exports = {
  name: 'ping',
  description: 'Replies with Pong!',
  run: async (ctx) => {
    await ctx.reply('Pong!');
  }
};
```

### Slash Commands

To create a slash command, add the `slash: true` property to your command file:
```javascript
// commands/hello.js
module.exports = {
  name: 'hello',
  description: 'Says hello to a user.',
  slash: true,
  args: [
    {
      name: 'user',
      description: 'The user to say hello to.',
      type: 'user', // Can be 'string', 'user', or 'number'
      required: true
    }
  ],
  run: async (ctx) => {
    const user = ctx.options[0].user;
    await ctx.reply(`Hello, ${user}!`);
  }
};
```

### Command Properties

-   `name`: The name of the command.
-   `description`: A brief description of the command.
-   `run`: The function to execute when the command is called.
-   `aliases`: An array of alternative names for the command.
-   `cooldown`: The cooldown period for the command (e.g., `'5s'`, `'1m'`).
-   `permissions`: An array of permissions required to use the command.
-   `guildOnly`: If `true`, the command can only be used in a server.
-   `nsfwOnly`: If `true`, the command can only be used in an NSFW channel.
-   `devOnly`: If `true`, the command can only be used by the bot owner.

## Event Handling

To handle a Discord event, create a file in your `events` directory with the name of the event (e.g., `ready.js` for the `ready` event):

```javascript
// events/ready.js
module.exports = (ctx) => {
  console.log(`Logged in as ${ctx.bot.client.user.tag}!`);
};
```

To handle an event only once, prefix the filename with `once_` (e.g., `once_ready.js`).

## The `ctx` Object

The `ctx` (context) object is a powerful wrapper around Discord.js's `Message` and `Interaction` objects. It provides a unified API for interacting with commands and events, regardless of their source.

### Key `ctx` Properties

-   `ctx.raw`: The raw `Message` or `Interaction` object.
-   `ctx.bot`: The `Bot` instance.
-   `ctx.user`: The user who triggered the command/event.
-   `ctx.guild`: The guild where the command/event was triggered.
-   `ctx.channel`: The channel where the command/event was triggered.
-   `ctx.member`: The guild member who triggered the command/event.
-   `ctx.args`: An array of arguments for message commands.
-   `ctx.options`: An array of options for slash commands.

### Key `ctx` Methods

-   `ctx.reply(content, options)`: Sends a reply.
-   `ctx.embed(content)`: Sends a simple embed or returns an embed builder.
-   `ctx.success(message)`: Sends a pre-formatted success message.
-   `ctx.error(message)`: Sends a pre-formatted error message.
-   `ctx.awaitMessage(filter, options)`: Awaits a message from the user.
-   `ctx.awaitReaction(emojis, options)`: Awaits a reaction from the user.

## Framework Utilities

### `db.js`

The `db.js` utility provides a simple key-value store using `lowdb`.

-   `getGuildConfig(guildId, key, defaultValue)`
-   `setGuildConfig(guildId, key, value)`
-   `getUserConfig(userId, key, defaultValue)`
-   `setUserConfig(userId, key, value)`

### `logger.js`

The `logger.js` utility provides color-coded logging to the console.

-   `logger.info(message)`
-   `logger.warn(message)`
-   `logger.error(message)`

### `scheduler.js`

The `scheduler.js` utility allows you to schedule tasks.

-   `scheduler.every(interval, fn)`: Runs a function at a specified interval.
-   `scheduler.cron(expression, fn)`: Runs a function based on a cron expression.

### `queue.js`

The `queue.js` utility provides a simple queue implementation.

-   `getQueue(name)`: Gets a queue instance.
-   `queue.enqueue(item)`: Adds an item to the queue.
-.
-   `queue.dequeue()`: Removes an item from the queue.

## Advanced Features

### Inhibitors

Inhibitors are functions that can prevent a command from running.

```javascript
bot.addInhibitor(async (cmd, ctx) => {
  if (cmd.name === 'secret' && ctx.user.id !== 'some_user_id') {
    return 'You are not allowed to use this command!';
  }
});
```

### Middleware

You can set middleware functions to run before or after commands and events.

-   `bot.beforeCommand(handler)`
-   `bot.afterCommand(handler)`
-   `bot.beforeEvent(handler)`

### Command Overloads

You can define multiple implementations for a single command based on the arguments.

```javascript
// commands/ban.js
module.exports = {
  name: 'ban',
  description: 'Bans a user.',
  overload: true,
  patterns: [
    {
      match: [/(\d{17,19})/], // Match user ID
      run: async (ctx, [userId]) => { /* ... */ }
    },
    {
      match: [/@?(\w+#\d{4})/], // Match username#tag
      run: async (ctx, [userTag]) => { /* ... */ }
    }
  ]
};
```

### Hot-Reloading

`better-djs` supports hot-reloading of commands and events for a seamless development experience.

-   `bot.reloadCommands()`
-   `bot.reloadEvents()`

## Full Bot Example

```javascript
// my-bot.js
const { Bot } = require('./better-djs');
require('dotenv').config();

const bot = new Bot(process.env.TOKEN, {
  clientId: process.env.CLIENT_ID,
  commandsDir: 'commands',
  eventsDir: 'events',
  prefix: '!'
});

// A simple inline command
bot.command('greet', (ctx) => {
  ctx.reply(`Hello, ${ctx.user.username}!`);
});

// A simple inline event
bot.on('messageCreate', (ctx, message) => {
  if (message.content === 'hello bot') {
    ctx.reply('Hello there!');
  }
});

bot.start();
```

This guide provides a comprehensive overview of the `better-djs` framework. For more detailed information on specific methods and properties, please refer to the JSDoc comments within the source code.
