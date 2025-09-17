# Quick Start Guide

Get up and running with @axrxvm/betterdiscordjs in just a few minutes! This guide will help you create your first Discord bot using the framework.

## 🚀 5-Minute Bot

Let's create a simple but functional Discord bot:

### Step 1: Basic Setup

```javascript
// index.js
const { Bot } = require('@axrxvm/betterdiscordjs');
require('dotenv').config();

const bot = new Bot(process.env.DISCORD_TOKEN, {
  prefix: '!',
  commandsDir: './commands',
  eventsDir: './events',
  devGuild: process.env.DEV_GUILD, // For slash command testing
  clientId: process.env.CLIENT_ID
});
```

### Step 2: Add Your First Command

```javascript
// Inline command - quick and easy
bot.command('hello', async (ctx) => {
  await ctx.reply(`Hello, ${ctx.user.username}! 👋`);
}, {
  description: 'Say hello to the bot',
  slash: true // Enable as slash command too
});

// More advanced command with embed
bot.command('info', async (ctx) => {
  const embed = ctx.embed()
    .title('🤖 Bot Information')
    .desc('I am a Discord bot built with @axrxvm/betterdiscordjs!')
    .field('Uptime', `${Math.floor(process.uptime() / 60)} minutes`, true)
    .field('Commands', bot.commands.size.toString(), true)
    .color('blue')
    .timestamp();
  
  await embed.send();
});
```

### Step 3: Add Event Handlers

```javascript
// Ready event
bot.on('ready', (ctx) => {
  console.log(`✅ ${ctx.user.tag} is online!`);
  
  // Set bot presence
  bot.setPresence({
    activities: [{ name: 'with @axrxvm/betterdiscordjs', type: 0 }],
    status: 'online'
  });
});

// Welcome new members
bot.on('guildMemberAdd', async (ctx, member) => {
  const channel = member.guild.systemChannel;
  if (channel) {
    const embed = ctx.embed()
      .title('👋 Welcome!')
      .desc(`Welcome to the server, ${member.user.username}!`)
      .thumbnail(member.user.displayAvatarURL())
      .color('green');
    
    await channel.send({ embeds: [embed.embed] });
  }
});
```

### Step 4: Start Your Bot

```javascript
// Start the bot
bot.start().then(() => {
  console.log('🚀 Bot is now running!');
}).catch(console.error);
```

### Complete Example

Here's the full `index.js` file:

```javascript
const { Bot } = require('@axrxvm/betterdiscordjs');
require('dotenv').config();

const bot = new Bot(process.env.DISCORD_TOKEN, {
  prefix: '!',
  commandsDir: './commands',
  eventsDir: './events',
  devGuild: process.env.DEV_GUILD,
  clientId: process.env.CLIENT_ID
});

// Commands
bot.command('hello', async (ctx) => {
  await ctx.reply(`Hello, ${ctx.user.username}! 👋`);
}, {
  description: 'Say hello to the bot',
  slash: true
});

bot.command('info', async (ctx) => {
  const embed = ctx.embed()
    .title('🤖 Bot Information')
    .desc('I am a Discord bot built with @axrxvm/betterdiscordjs!')
    .field('Uptime', `${Math.floor(process.uptime() / 60)} minutes`, true)
    .field('Commands', bot.commands.size.toString(), true)
    .color('blue')
    .timestamp();
  
  await embed.send();
});

// Events
bot.on('ready', (ctx) => {
  console.log(`✅ ${ctx.user.tag} is online!`);
  bot.setPresence({
    activities: [{ name: 'with @axrxvm/betterdiscordjs', type: 0 }],
    status: 'online'
  });
});

bot.on('guildMemberAdd', async (ctx, member) => {
  const channel = member.guild.systemChannel;
  if (channel) {
    const embed = ctx.embed()
      .title('👋 Welcome!')
      .desc(`Welcome to the server, ${member.user.username}!`)
      .thumbnail(member.user.displayAvatarURL())
      .color('green');
    
    await channel.send({ embeds: [embed.embed] });
  }
});

// Start the bot
bot.start().then(() => {
  console.log('🚀 Bot is now running!');
}).catch(console.error);
```

## 📁 File-Based Commands

For better organization, create separate command files:

### Create a Command File

```javascript
// commands/general/ping.js
module.exports = {
  name: 'ping',
  description: 'Check bot latency',
  category: 'General',
  slash: true,
  
  async run(ctx) {
    const start = Date.now();
    const msg = await ctx.reply('🏓 Pinging...');
    const end = Date.now();
    
    const embed = ctx.embed()
      .title('🏓 Pong!')
      .field('Bot Latency', `${end - start}ms`, true)
      .field('API Latency', `${ctx.client.ws.ping}ms`, true)
      .color('green');
    
    await msg.edit({ embeds: [embed.embed] });
  }
};
```

### Create an Event File

```javascript
// events/messageCreate.js
module.exports = {
  name: 'messageCreate',
  once: false,
  
  async execute(ctx, message) {
    // Auto-react to messages containing "hello"
    if (message.content.toLowerCase().includes('hello') && !message.author.bot) {
      await message.react('👋');
    }
  }
};
```

## 🎨 Using the Embed Builder

@axrxvm/betterdiscordjs includes a powerful embed builder:

```javascript
bot.command('embed-demo', async (ctx) => {
  const embed = ctx.embed()
    .title('🎨 Embed Demo')
    .desc('This is a demonstration of the @axrxvm/betterdiscordjs embed builder!')
    .field('Field 1', 'This is inline', true)
    .field('Field 2', 'This is also inline', true)
    .field('Field 3', 'This is not inline', false)
    .author(ctx.user.username, ctx.user.displayAvatarURL())
    .thumbnail('https://example.com/image.png')
    .footer('Powered by @axrxvm/betterdiscordjs')
    .color('random') // or use hex colors, named colors, etc.
    .timestamp();
  
  await embed.send();
});
```

## 🔧 Adding Middleware

Add global command hooks for logging and error handling:

```javascript
// Log all command usage
bot.onCommandRun((cmd, ctx) => {
  console.log(`[CMD] ${ctx.user.tag} used ${cmd.name} in ${ctx.guild?.name || 'DM'}`);
});

// Handle command errors gracefully
bot.onCommandError(async (err, cmd, ctx) => {
  console.error(`[ERROR] Command ${cmd.name} failed:`, err.message);
  await ctx.error('Something went wrong while executing this command.');
});
```

## 🎯 Interactive Components

Create interactive buttons and menus:

```javascript
bot.command('interactive', async (ctx) => {
  const embed = ctx.embed()
    .title('🎮 Interactive Demo')
    .desc('Click a button below!');
  
  const row = ctx.buttonRow([
    { customId: 'success', label: '✅ Success', style: 3 },
    { customId: 'danger', label: '❌ Danger', style: 4 }
  ]);
  
  const msg = await ctx.reply({ embeds: [embed.embed], components: [row] });
  
  // Handle button clicks
  await ctx.awaitButton(msg, {
    success: async (interaction) => {
      await interaction.reply({ content: '✅ Success button clicked!', ephemeral: true });
    },
    danger: async (interaction) => {
      await interaction.reply({ content: '❌ Danger button clicked!', ephemeral: true });
    }
  });
});
```

## 📊 Built-in Features

@axrxvm/betterdiscordjs comes with many built-in features:

```javascript
// Rate limiting (automatic)
bot.command('limited', async (ctx) => {
  await ctx.reply('This command is automatically rate limited!');
}, {
  cooldown: '5s' // 5 second cooldown
});

// Permission checks
bot.command('admin', async (ctx) => {
  await ctx.reply('You have admin permissions!');
}, {
  permissions: ['Administrator']
});

// Guild-only commands
bot.command('server-only', async (ctx) => {
  await ctx.reply('This only works in servers!');
}, {
  guildOnly: true
});
```

## 🚀 Running Your Bot

1. Make sure your `.env` file is configured
2. Run your bot:

```bash
node index.js
```

3. Invite your bot to a server with appropriate permissions
4. Test your commands!

## 📈 Next Steps

Now that you have a basic bot running:

1. 📖 Learn about [Configuration Options](./configuration.md)
2. 🏗️ Explore [Core Concepts](../core/bot-class.md)
3. 📦 Try the [Plugin System](../plugins/overview.md)
4. 🎨 Master the [Embed Builder](../advanced/embed-builder.md)
5. 🔧 Add [Advanced Features](../advanced/components.md)

## 💡 Tips for Beginners

- **Start Small**: Begin with simple commands and gradually add complexity
- **Use the Context**: The `ctx` object provides everything you need for Discord interactions
- **Error Handling**: Always wrap async operations in try-catch blocks
- **Testing**: Use a development server to test your bot before going live
- **Documentation**: Keep this documentation handy as you develop

## 🆘 Need Help?

- 📖 Check the [full documentation](../index.md)
- 🐛 Report issues on [GitHub](https://github.com/axrxvm/betterdiscordjs/issues)
- 💬 Join our [Discord community](https://discord.gg/your-server)

---

**Congratulations!** You've created your first @axrxvm/betterdiscordjs bot. The framework provides many more features to explore as you build more complex bots.##
 Next Steps

Continue your @axrxvm/betterdiscordjs journey:

1. 📦 [Installation Guide](./installation.md) - Detailed setup and troubleshooting
2. ⚙️ [Configuration](./configuration.md) - Master all configuration options
3. 📝 [Your First Bot](./first-bot.md) - Build a complete bot step by step
4. 🏗️ [Bot Class](../core/bot-class.md) - Understand the core Bot class






