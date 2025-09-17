# Your First Bot

This guide will walk you through creating your first Discord bot using @axrxvm/betterdiscordjs.

## Prerequisites

Before you begin, make sure you have:
- Node.js (v16.9.0 or higher) installed
- A Discord application and bot token
- Basic knowledge of JavaScript

## Creating Your Bot

### 1. Set Up Your Project

Create a new directory for your bot and initialize it:

```bash
mkdir my-discord-bot
cd my-discord-bot
npm init -y
npm install @axrxvm/betterdiscordjs
```

### 2. Create Your Bot File

Create an `index.js` file:

```javascript
const { Bot } = require('@axrxvm/betterdiscordjs');

// Create a new bot instance
const bot = new Bot(process.env.DISCORD_TOKEN, {
  prefix: '!',
  devGuild: 'YOUR_DEV_GUILD_ID', // Optional: for testing slash commands
  clientId: 'YOUR_CLIENT_ID'
});

// Add a simple ping command
bot.command('ping', async (ctx) => {
  await ctx.reply('🏓 Pong!');
}, 'Check if the bot is responsive');

// Add a slash command
bot.command('hello', async (ctx) => {
  await ctx.reply(`Hello, ${ctx.user.username}!`);
}, {
  description: 'Say hello to the user',
  slash: true
});

// Add an event listener
bot.on('ready', (ctx) => {
  console.log(`Bot is ready! Logged in as ${ctx.client.user.tag}`);
});

// Start the bot
bot.start();
```

### 3. Environment Variables

Create a `.env` file in your project root:

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_bot_client_id_here
```

### 4. Run Your Bot

```bash
node index.js
```

## Understanding the Code

### Bot Instance
```javascript
const bot = new Bot(token, options);
```
Creates a new bot instance with your token and configuration options.

### Commands
```javascript
bot.command('name', handler, description);
```
Registers a new command that responds to both prefix and slash commands.

### Events
```javascript
bot.on('eventName', handler);
```
Listens for Discord events and executes your handler function.

### Context Object
The `ctx` parameter in your handlers contains useful methods and properties:
- `ctx.reply()` - Reply to the command
- `ctx.user` - The user who triggered the command
- `ctx.guild` - The guild where the command was used
- `ctx.channel` - The channel where the command was used

## Next Steps

Now that you have a basic bot running, you can:
- Add more commands and events
- Explore the plugin system
- Learn about advanced features like embeds and components
- Set up proper error handling and logging

Check out the [Commands](../core/commands.md) and [Events](../core/events.md) documentation to learn more about building powerful bot functionality.






