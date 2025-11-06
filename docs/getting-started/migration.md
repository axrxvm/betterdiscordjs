# Migration Guide: From Discord.js to betterdiscordjs

This guide helps you migrate your existing Discord.js bot to betterdiscordjs. The framework is built on top of discord.js v14, so you keep all the power while gaining additional features and better developer experience.

## Table of Contents

- [Why Migrate?](#why-migrate)
- [Quick Comparison](#quick-comparison)
- [Step-by-Step Migration](#step-by-step-migration)
- [API Changes](#api-changes)
- [Breaking Changes](#breaking-changes)
- [Common Patterns](#common-patterns)
- [FAQ](#faq)

## Why Migrate?

- ✅ **Less Boilerplate** - Write cleaner, more maintainable code
- ✅ **Unified Commands** - Handle both slash and prefix commands with the same code
- ✅ **Enhanced Context** - Simplified API interactions via the `ctx` object
- ✅ **Built-in Features** - Rate limiting, logging, caching, scheduling out of the box
- ✅ **Plugin System** - Modular architecture for common features
- ✅ **Hot Reloading** - Faster development workflow
- ✅ **100% Compatible** - Keep using discord.js features when needed

## Quick Comparison

### Before (Discord.js)

```javascript
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  if (message.content === '!ping') {
    await message.reply('Pong!');
  }
  
  if (message.content === '!info') {
    const embed = new EmbedBuilder()
      .setTitle('Bot Info')
      .setDescription('A Discord bot')
      .setColor(0x5865F2)
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  
  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
});

client.login(process.env.TOKEN);
```

### After (betterdiscordjs)

```javascript
const { Bot } = require('@axrxvm/betterdiscordjs');

const bot = new Bot(process.env.TOKEN, {
  prefix: '!',
  commandsDir: './commands',
  eventsDir: './events'
});

// Works for both slash AND prefix commands!
bot.command('ping', async (ctx) => {
  await ctx.reply('Pong!');
}, { 
  description: 'Check bot latency',
  slash: true 
});

bot.command('info', async (ctx) => {
  const embed = ctx.embed()
    .title('Bot Info')
    .desc('A Discord bot')
    .color('blue')
    .timestamp();
  await embed.send();
}, { slash: true });

bot.on('ready', (ctx) => {
  console.log(`Logged in as ${ctx.user.tag}`);
});

bot.start();
```

## Step-by-Step Migration

### 1. Install betterdiscordjs

```bash
npm install @axrxvm/betterdiscordjs
```

**Note:** betterdiscordjs includes discord.js as a dependency, so you don't need to install it separately.

### 2. Replace Client with Bot

**Before:**
```javascript
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});
```

**After:**
```javascript
const { Bot } = require('@axrxvm/betterdiscordjs');

const bot = new Bot(process.env.TOKEN, {
  prefix: '!',
  commandsDir: './commands',
  eventsDir: './events'
});
// Intents are automatically configured for common use cases
// You can still customize them if needed (see Advanced Configuration)
```

### 3. Migrate Event Handlers

**Before:**
```javascript
client.on('ready', () => {
  console.log('Bot is ready!');
});

client.on('messageCreate', (message) => {
  // Handle message
});
```

**After:**
```javascript
// Option 1: Inline (for simple handlers)
bot.on('ready', (ctx) => {
  console.log(`${ctx.user.tag} is ready!`);
});

// Option 2: File-based (recommended for organization)
// Create ./events/ready.js
module.exports = {
  name: 'ready',
  once: true,
  run: (ctx) => {
    console.log(`${ctx.user.tag} is ready!`);
  }
};
```

### 4. Migrate Commands

#### From Message-Based Commands

**Before:**
```javascript
client.on('messageCreate', async (message) => {
  if (message.content === '!ping') {
    await message.reply('Pong!');
  }
  
  if (message.content.startsWith('!say ')) {
    const text = message.content.slice(5);
    await message.channel.send(text);
  }
});
```

**After:**
```javascript
// Option 1: Inline commands
bot.command('ping', async (ctx) => {
  await ctx.reply('Pong!');
});

bot.command('say', async (ctx) => {
  await ctx.send(ctx.args.join(' '));
}, {
  description: 'Make the bot say something'
});

// Option 2: File-based (create ./commands/ping.js)
module.exports = {
  name: 'ping',
  description: 'Check bot latency',
  run: async (ctx) => {
    await ctx.reply('Pong!');
  }
};
```

#### From Slash Commands

**Before:**
```javascript
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

// Register slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
await rest.put(
  Routes.applicationCommands(CLIENT_ID),
  { body: commands }
);

// Handle interactions
client.on('interactionCreate', async (interaction) => {
  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
});
```

**After:**
```javascript
// Just add slash: true!
bot.command('ping', async (ctx) => {
  await ctx.reply('Pong!');
}, {
  description: 'Replies with Pong!',
  slash: true // Automatically registers and handles slash command
});

bot.start(); // Slash commands are automatically registered
```

### 5. Migrate Embeds

**Before:**
```javascript
const { EmbedBuilder } = require('discord.js');

const embed = new EmbedBuilder()
  .setTitle('Hello')
  .setDescription('World')
  .setColor(0x5865F2)
  .addFields(
    { name: 'Field 1', value: 'Value 1', inline: true },
    { name: 'Field 2', value: 'Value 2', inline: true }
  )
  .setTimestamp()
  .setFooter({ text: 'Footer' });

await message.reply({ embeds: [embed] });
```

**After:**
```javascript
// Using the fluent embed builder
const embed = ctx.embed()
  .title('Hello')
  .desc('World')
  .color('blue') // Named colors supported!
  .field('Field 1', 'Value 1', true)
  .field('Field 2', 'Value 2', true)
  .timestamp()
  .footer('Footer');

await embed.send(); // Automatically sends to the context
```

### 6. Update Login

**Before:**
```javascript
client.login(process.env.TOKEN);
```

**After:**
```javascript
bot.start(); // Token was provided in constructor
```

## API Changes

### Context Object (`ctx`)

The biggest change is the introduction of the `ctx` (context) object. It wraps discord.js objects and provides convenient methods.

#### Available Properties

```javascript
ctx.bot           // Bot instance
ctx.client        // Discord.js Client
ctx.message       // Message object (for prefix commands)
ctx.interaction   // Interaction object (for slash commands)
ctx.user          // User who triggered the command
ctx.member        // GuildMember object
ctx.guild         // Guild object
ctx.channel       // Channel object
ctx.args          // Command arguments (array)
ctx.options       // Slash command options
```

#### Common Methods

```javascript
// Replies
await ctx.reply('Hello!');
await ctx.send('Message');
await ctx.success('Success!');   // Green embed
await ctx.error('Error!');       // Red embed
await ctx.info('Info');          // Blue embed
await ctx.warn('Warning');       // Yellow embed

// Embeds
const embed = ctx.embed()
  .title('Title')
  .desc('Description')
  .color('blue')
  .send();

// User interactions
const user = await ctx.fetchUser('123456789');
const member = await ctx.fetchMember('123456789');
await ctx.dm(user, 'DM message');

// Components
const row = ctx.buttonRow([
  { customId: 'btn1', label: 'Button 1', style: 1 }
]);

// Awaiting responses
const msg = await ctx.awaitMessage(filter, { time: 30000 });
await ctx.awaitButton(message, {
  btn1: (interaction) => interaction.reply('Clicked!')
});

// Pagination
await ctx.paginate([embed1, embed2, embed3]);

// Modals
const result = await ctx.modal([
  { customId: 'input', label: 'Input', style: 1 }
]);

// Sessions (per-user data)
ctx.session.count = (ctx.session.count || 0) + 1;
```

### Command Options

```javascript
bot.command('name', handler, {
  description: 'Command description',
  slash: true,              // Enable as slash command
  aliases: ['alias1'],      // Command aliases (prefix only)
  cooldown: 5000,          // Cooldown in milliseconds
  permissions: ['ManageMessages'],
  ownerOnly: true,          // Only bot owner can use
  guildOnly: true,          // Can't use in DMs
  args: {
    required: 1,            // Minimum arguments
    usage: '<user> [reason]'
  },
  before: async (ctx) => {},   // Pre-execution hook
  after: async (ctx) => {},    // Post-execution hook
  onError: async (err, ctx) => {} // Error handler
});
```

### Event Handlers

```javascript
// File-based event (./events/messageCreate.js)
module.exports = {
  name: 'messageCreate',
  once: false,               // If true, fires only once
  run: async (ctx, message) => {
    // Handle event
    // First param is always ctx, then original discord.js params
  }
};
```

## Breaking Changes

### 1. Client Access

**Before:**
```javascript
client.user.setActivity('Playing games');
```

**After:**
```javascript
// Via bot instance
bot.client.user.setActivity('Playing games');

// Or via context
ctx.client.user.setActivity('Playing games');
```

### 2. Command Registration

Commands must be registered before calling `bot.start()`:

```javascript
// ❌ Wrong
bot.start();
bot.command('ping', handler); // Won't work!

// ✅ Correct
bot.command('ping', handler);
bot.start();
```

### 3. Event Parameters

Events receive `ctx` as the first parameter:

```javascript
// Before
client.on('messageCreate', (message) => {});

// After
bot.on('messageCreate', (ctx, message) => {
  // ctx is always first
  // Original params follow
});
```

## Common Patterns

### Database Integration

```javascript
const { Bot } = require('@axrxvm/betterdiscordjs');

const bot = new Bot(token, {
  database: {
    type: 'json',
    path: './data/db.json'
  }
});

// Use the built-in database
bot.command('setdata', async (ctx) => {
  await ctx.bot.db.set(`users.${ctx.user.id}`, { coins: 100 });
  await ctx.success('Data saved!');
});

bot.command('getdata', async (ctx) => {
  const data = await ctx.bot.db.get(`users.${ctx.user.id}`);
  await ctx.info(`You have ${data?.coins || 0} coins`);
});
```

### Rate Limiting

```javascript
const { rateLimit } = require('@axrxvm/betterdiscordjs');

bot.command('daily', async (ctx) => {
  // Built-in rate limiting
}, {
  cooldown: 86400000 // 24 hours in milliseconds
});

// Or use the utility
const limiter = rateLimit(5, 60000); // 5 uses per minute

bot.command('spam', async (ctx) => {
  if (limiter.isLimited(ctx.user.id)) {
    return ctx.warn('Slow down! Try again later.');
  }
  await ctx.reply('Command executed!');
});
```

### Scheduled Tasks

```javascript
// Run every 5 minutes
bot.every('5m', () => {
  console.log('Task running every 5 minutes');
});

// Cron expression (every day at 9 AM)
bot.cron('0 9 * * *', async () => {
  const channel = bot.client.channels.cache.get('CHANNEL_ID');
  await channel.send('Good morning! ☀️');
});
```

### Plugin Usage

```javascript
const { Bot, plugins } = require('@axrxvm/betterdiscordjs');

const bot = new Bot(token)
  .use(plugins.WelcomePlugin)
  .use(plugins.ModerationPlugin)
  .use(plugins.AutoModPlugin);

bot.start();
```

### Accessing Discord.js Directly

You can always access the underlying discord.js client:

```javascript
// Full discord.js API is still available
const { EmbedBuilder } = require('discord.js');

bot.command('advanced', async (ctx) => {
  // Use discord.js directly
  const embed = new EmbedBuilder()
    .setTitle('Advanced')
    .setDescription('Using discord.js directly');
  
  await ctx.message.reply({ embeds: [embed] });
  
  // Or use the framework's helpers
  await ctx.embed().title('Advanced').desc('Using helpers').send();
});
```

## FAQ

### Can I gradually migrate my bot?

Yes! You can run discord.js code alongside betterdiscordjs:

```javascript
const { Bot } = require('@axrxvm/betterdiscordjs');

const bot = new Bot(token);

// betterdiscordjs command
bot.command('ping', async (ctx) => {
  await ctx.reply('Pong!');
});

// Use discord.js client directly
bot.client.on('messageCreate', (message) => {
  // Your existing discord.js code
});

bot.start();
```

### Do I need to rewrite all my commands at once?

No! Start with new commands using betterdiscordjs, and gradually migrate old ones.

### What about my existing slash commands?

They'll continue to work through discord.js, but you can migrate them to use the unified command system:

```javascript
// Your old slash command handler
bot.client.on('interactionCreate', async (interaction) => {
  if (interaction.commandName === 'oldcommand') {
    await interaction.reply('This still works!');
  }
});

// New unified command (works for both slash and prefix)
bot.command('newcommand', async (ctx) => {
  await ctx.reply('Works everywhere!');
}, { slash: true });
```

### Is discord.js v14 required?

Yes, betterdiscordjs is built on discord.js v14. If you're on v13 or earlier, you'll need to update discord.js first. See the [discord.js migration guide](https://discordjs.guide/additional-info/changes-in-v14.html).

### What if I need a discord.js feature not wrapped by betterdiscordjs?

Access it directly via `bot.client` or `ctx.client`:

```javascript
bot.command('example', async (ctx) => {
  // Access any discord.js feature
  const webhooks = await ctx.channel.fetchWebhooks();
  // ...
});
```

### How do I migrate custom event emitters?

```javascript
// Before
client.on('customEvent', (data) => {});

// After
bot.client.on('customEvent', (data) => {});
// or
bot.on('customEvent', (ctx, data) => {});
```

### Can I use TypeScript?

Yes! While official TypeScript definitions are in progress, you can use JSDoc for type hints:

```javascript
/**
 * @param {import('@axrxvm/betterdiscordjs').Ctx} ctx
 */
bot.command('typed', async (ctx) => {
  // You'll get autocomplete for ctx methods
});
```

## Getting Help

- 📖 [Full Documentation](../index.md)
- 🐛 [Report Issues](https://github.com/axrxvm/betterdiscordjs/issues)
- 💬 [Discussions](https://github.com/axrxvm/betterdiscordjs/discussions)
- 📋 [Examples](../examples/commands.md)

---

**Ready to migrate?** Start with a simple command and see how much cleaner your code becomes! 🚀
