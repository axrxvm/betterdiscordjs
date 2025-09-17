# Basic Bot Examples

This section provides complete examples of basic Discord bots built with @axrxvm/betterdiscordjs, from simple ping bots to more feature-rich applications.

## Simple Ping Bot

The most basic bot that responds to a ping command.

```javascript
const { Bot } = require('@axrxvm/betterdiscordjs');

const bot = new Bot(process.env.DISCORD_TOKEN, {
  prefix: '!',
  commandsDir: './commands',
  eventsDir: './events'
});

// Simple ping command
bot.command('ping', async (ctx) => {
  const start = Date.now();
  const msg = await ctx.reply('🏓 Pinging...');
  const latency = Date.now() - start;
  
  await msg.edit(`🏓 Pong! Latency: ${latency}ms | API: ${bot.client.ws.ping}ms`);
}, {
  description: 'Check bot latency',
  cooldown: '3s'
});

// Ready event
bot.on('ready', async (ctx) => {
  console.log(`✅ ${ctx.client.user.tag} is online!`);
  
  // Set bot status
  bot.setPresence({
    status: 'online',
    activities: [{
      name: 'with Discord.js',
      type: 'PLAYING'
    }]
  });
});

bot.start();
```

## Welcome Bot

A bot that welcomes new members and handles member events.

```javascript
const { Bot } = require('@axrxvm/betterdiscordjs');

const bot = new Bot(process.env.DISCORD_TOKEN, {
  prefix: '!',
  devGuild: process.env.DEV_GUILD_ID
});

// Welcome new members
bot.on('guildMemberAdd', async (ctx) => {
  const member = ctx.raw;
  const guild = member.guild;
  
  // Find welcome channel
  const welcomeChannel = guild.channels.cache.find(
    channel => channel.name === 'welcome' || channel.name === 'general'
  );
  
  if (welcomeChannel) {
    const embed = ctx.embed()
      .title('👋 Welcome!')
      .desc(`Welcome to **${guild.name}**, ${member.user}!`)
      .field('Member Count', guild.memberCount.toString(), true)
      .field('Account Created', member.user.createdAt.toDateString(), true)
      .thumbnail(member.user.displayAvatarURL())
      .color('green')
      .footer(`User ID: ${member.user.id}`);
    
    await welcomeChannel.send({ embeds: [embed.embed] });
  }
  
  // Auto-assign role
  const defaultRole = guild.roles.cache.find(role => role.name === 'Member');
  if (defaultRole) {
    try {
      await member.roles.add(defaultRole);
    } catch (error) {
      console.error('Failed to assign default role:', error);
    }
  }
});

// Goodbye message
bot.on('guildMemberRemove', async (ctx) => {
  const member = ctx.raw;
  const guild = member.guild;
  
  const logChannel = guild.channels.cache.find(
    channel => channel.name === 'member-log' || channel.name === 'general'
  );
  
  if (logChannel) {
    const embed = ctx.embed()
      .title('👋 Goodbye')
      .desc(`${member.user.tag} has left the server`)
      .field('Member Count', guild.memberCount.toString(), true)
      .field('Joined', member.joinedAt?.toDateString() || 'Unknown', true)
      .thumbnail(member.user.displayAvatarURL())
      .color('red')
      .timestamp();
    
    await logChannel.send({ embeds: [embed.embed] });
  }
});

// Server info command
bot.command('serverinfo', async (ctx) => {
  const guild = ctx.guild;
  
  const embed = ctx.embed()
    .title(`📊 ${guild.name} Information`)
    .thumbnail(guild.iconURL())
    .field('Owner', guild.owner?.user.tag || 'Unknown', true)
    .field('Members', guild.memberCount.toString(), true)
    .field('Channels', guild.channels.cache.size.toString(), true)
    .field('Roles', guild.roles.cache.size.toString(), true)
    .field('Created', guild.createdAt.toDateString(), true)
    .field('Boost Level', guild.premiumTier.toString(), true)
    .color('blue')
    .footer(`Server ID: ${guild.id}`);
  
  await embed.send();
}, {
  description: 'Show server information',
  guildOnly: true
});

bot.start();
```

## Utility Bot

A bot with various utility commands.

```javascript
const { Bot } = require('@axrxvm/betterdiscordjs');

const bot = new Bot(process.env.DISCORD_TOKEN, {
  prefix: '?',
  commandsDir: './commands'
});

// Avatar command
bot.command('avatar', async (ctx) => {
  const user = ctx.getUser('user') || ctx.user;
  
  const embed = ctx.embed()
    .title(`${user.tag}'s Avatar`)
    .image(user.displayAvatarURL({ size: 512 }))
    .color('blue');
  
  await embed.send();
}, {
  description: 'Show user avatar',
  options: [{
    name: 'user',
    description: 'User to show avatar for',
    type: 6, // USER
    required: false
  }],
  slash: true
});

// User info command
bot.command('userinfo', async (ctx) => {
  const user = ctx.getUser('user') || ctx.user;
  const member = ctx.guild?.members.cache.get(user.id);
  
  const embed = ctx.embed()
    .title(`👤 ${user.tag}`)
    .thumbnail(user.displayAvatarURL())
    .field('ID', user.id, true)
    .field('Created', user.createdAt.toDateString(), true)
    .field('Bot', user.bot ? 'Yes' : 'No', true);
  
  if (member) {
    embed
      .field('Joined Server', member.joinedAt?.toDateString() || 'Unknown', true)
      .field('Nickname', member.nickname || 'None', true)
      .field('Roles', member.roles.cache.size - 1, true); // Exclude @everyone
  }
  
  embed.color(member?.displayHexColor || 'blue');
  
  await embed.send();
}, {
  description: 'Show user information',
  options: [{
    name: 'user',
    description: 'User to show info for',
    type: 6,
    required: false
  }],
  slash: true
});

// Random number command
bot.command('random', async (ctx) => {
  const min = parseInt(ctx.getOption('min')) || 1;
  const max = parseInt(ctx.getOption('max')) || 100;
  
  if (min >= max) {
    return ctx.error('❌ Minimum must be less than maximum!');
  }
  
  const random = Math.floor(Math.random() * (max - min + 1)) + min;
  
  await ctx.reply(`🎲 Random number between ${min} and ${max}: **${random}**`);
}, {
  description: 'Generate a random number',
  options: [
    {
      name: 'min',
      description: 'Minimum number',
      type: 4, // INTEGER
      required: false
    },
    {
      name: 'max',
      description: 'Maximum number',
      type: 4,
      required: false
    }
  ],
  slash: true
});

// Poll command
bot.command('poll', async (ctx) => {
  const question = ctx.getOption('question') || ctx.args.join(' ');
  
  if (!question) {
    return ctx.error('❌ Please provide a question for the poll!');
  }
  
  const embed = ctx.embed()
    .title('📊 Poll')
    .desc(question)
    .footer(`Poll created by ${ctx.user.tag}`)
    .color('blue');
  
  const msg = await ctx.reply({ embeds: [embed.embed] });
  
  // Add reactions
  await msg.react('👍');
  await msg.react('👎');
  await msg.react('🤷');
}, {
  description: 'Create a poll',
  options: [{
    name: 'question',
    description: 'The poll question',
    type: 3, // STRING
    required: true
  }],
  slash: true
});

// Say command (echo)
bot.command('say', async (ctx) => {
  const message = ctx.getOption('message') || ctx.args.join(' ');
  
  if (!message) {
    return ctx.error('❌ Please provide a message to say!');
  }
  
  // Delete the original command message if it's a prefix command
  if (!ctx.isInteraction) {
    try {
      await ctx.raw.delete();
    } catch (error) {
      // Ignore if we can't delete
    }
  }
  
  await ctx.channel.send(message);
  
  if (ctx.isInteraction) {
    await ctx.reply({ content: '✅ Message sent!', ephemeral: true });
  }
}, {
  description: 'Make the bot say something',
  options: [{
    name: 'message',
    description: 'Message to say',
    type: 3,
    required: true
  }],
  slash: true,
  permissions: ['MANAGE_MESSAGES']
});

bot.start();
```

## Fun Bot

A bot focused on entertainment and fun commands.

```javascript
const { Bot } = require('@axrxvm/betterdiscordjs');

const bot = new Bot(process.env.DISCORD_TOKEN, {
  prefix: '!',
  commandsDir: './commands'
});

// 8ball command
bot.command('8ball', async (ctx) => {
  const question = ctx.getOption('question') || ctx.args.join(' ');
  
  if (!question) {
    return ctx.error('❌ Please ask a question!');
  }
  
  const responses = [
    'It is certain', 'It is decidedly so', 'Without a doubt',
    'Yes definitely', 'You may rely on it', 'As I see it, yes',
    'Most likely', 'Outlook good', 'Yes', 'Signs point to yes',
    'Reply hazy, try again', 'Ask again later', 'Better not tell you now',
    'Cannot predict now', 'Concentrate and ask again',
    'Don\'t count on it', 'My reply is no', 'My sources say no',
    'Outlook not so good', 'Very doubtful'
  ];
  
  const response = ctx.randomChoice(responses);
  
  const embed = ctx.embed()
    .title('🎱 Magic 8-Ball')
    .field('Question', question)
    .field('Answer', response)
    .color('purple');
  
  await embed.send();
}, {
  description: 'Ask the magic 8-ball a question',
  options: [{
    name: 'question',
    description: 'Your question',
    type: 3,
    required: true
  }],
  slash: true
});

// Coin flip command
bot.command('coinflip', async (ctx) => {
  const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
  const emoji = result === 'Heads' ? '🪙' : '🥈';
  
  await ctx.reply(`${emoji} **${result}**!`);
}, {
  description: 'Flip a coin',
  slash: true
});

// Dice roll command
bot.command('roll', async (ctx) => {
  const sides = parseInt(ctx.getOption('sides')) || 6;
  const count = parseInt(ctx.getOption('count')) || 1;
  
  if (sides < 2 || sides > 100) {
    return ctx.error('❌ Dice must have between 2 and 100 sides!');
  }
  
  if (count < 1 || count > 10) {
    return ctx.error('❌ You can roll between 1 and 10 dice!');
  }
  
  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }
  
  const total = rolls.reduce((sum, roll) => sum + roll, 0);
  
  const embed = ctx.embed()
    .title('🎲 Dice Roll')
    .field('Dice', `${count}d${sides}`)
    .field('Rolls', rolls.join(', '))
    .field('Total', total.toString())
    .color('green');
  
  await embed.send();
}, {
  description: 'Roll dice',
  options: [
    {
      name: 'sides',
      description: 'Number of sides on the dice',
      type: 4,
      required: false
    },
    {
      name: 'count',
      description: 'Number of dice to roll',
      type: 4,
      required: false
    }
  ],
  slash: true
});

// Joke command
bot.command('joke', async (ctx) => {
  const jokes = [
    "Why don't scientists trust atoms? Because they make up everything!",
    "Why did the scarecrow win an award? He was outstanding in his field!",
    "Why don't eggs tell jokes? They'd crack each other up!",
    "What do you call a fake noodle? An impasta!",
    "Why did the math book look so sad? Because it had too many problems!",
    "What do you call a bear with no teeth? A gummy bear!",
    "Why can't a bicycle stand up by itself? It's two tired!",
    "What do you call a sleeping bull? A bulldozer!",
    "Why did the cookie go to the doctor? Because it felt crumbly!",
    "What's the best thing about Switzerland? I don't know, but the flag is a big plus!"
  ];
  
  const joke = ctx.randomChoice(jokes);
  
  await ctx.reply(`😄 ${joke}`);
}, {
  description: 'Get a random joke',
  slash: true,
  cooldown: '5s'
});

// Choose command
bot.command('choose', async (ctx) => {
  const choices = ctx.getOption('choices')?.split(',') || ctx.args.join(' ').split(',');
  
  if (!choices || choices.length < 2) {
    return ctx.error('❌ Please provide at least 2 choices separated by commas!');
  }
  
  const trimmedChoices = choices.map(choice => choice.trim()).filter(choice => choice);
  
  if (trimmedChoices.length < 2) {
    return ctx.error('❌ Please provide at least 2 valid choices!');
  }
  
  const chosen = ctx.randomChoice(trimmedChoices);
  
  await ctx.reply(`🤔 I choose: **${chosen}**`);
}, {
  description: 'Choose between multiple options',
  options: [{
    name: 'choices',
    description: 'Choices separated by commas',
    type: 3,
    required: true
  }],
  slash: true
});

bot.start();
```

## Moderation Bot

A basic moderation bot with essential commands.

```javascript
const { Bot } = require('@axrxvm/betterdiscordjs');

const bot = new Bot(process.env.DISCORD_TOKEN, {
  prefix: '!',
  commandsDir: './commands',
  eventsDir: './events'
});

// Kick command
bot.command('kick', async (ctx) => {
  const member = ctx.getMember('user');
  const reason = ctx.getOption('reason') || 'No reason provided';
  
  if (!member) {
    return ctx.error('❌ User not found in this server!');
  }
  
  if (!member.kickable) {
    return ctx.error('❌ I cannot kick this user!');
  }
  
  try {
    await member.kick(reason);
    
    const embed = ctx.embed()
      .title('👢 User Kicked')
      .field('User', member.user.tag)
      .field('Moderator', ctx.user.tag)
      .field('Reason', reason)
      .color('orange')
      .timestamp();
    
    await embed.send();
    
    // Try to DM the user
    try {
      await member.user.send(`You were kicked from ${ctx.guild.name}. Reason: ${reason}`);
    } catch (error) {
      // User has DMs disabled
    }
    
  } catch (error) {
    console.error('Kick error:', error);
    await ctx.error('❌ Failed to kick user!');
  }
}, {
  description: 'Kick a user from the server',
  options: [
    {
      name: 'user',
      description: 'User to kick',
      type: 6,
      required: true
    },
    {
      name: 'reason',
      description: 'Reason for kick',
      type: 3,
      required: false
    }
  ],
  slash: true,
  guildOnly: true,
  permissions: ['KICK_MEMBERS']
});

// Clear messages command
bot.command('clear', async (ctx) => {
  const amount = parseInt(ctx.getOption('amount')) || parseInt(ctx.args[0]) || 10;
  
  if (amount < 1 || amount > 100) {
    return ctx.error('❌ Amount must be between 1 and 100!');
  }
  
  try {
    const messages = await ctx.channel.bulkDelete(amount, true);
    
    const embed = ctx.embed()
      .title('🧹 Messages Cleared')
      .field('Amount', messages.size.toString())
      .field('Moderator', ctx.user.tag)
      .color('green')
      .timestamp();
    
    const msg = await ctx.reply({ embeds: [embed.embed] });
    
    // Delete the confirmation message after 5 seconds
    setTimeout(() => {
      msg.delete().catch(() => {});
    }, 5000);
    
  } catch (error) {
    console.error('Clear error:', error);
    await ctx.error('❌ Failed to clear messages! Messages might be too old.');
  }
}, {
  description: 'Clear messages from the channel',
  options: [{
    name: 'amount',
    description: 'Number of messages to clear (1-100)',
    type: 4,
    required: false
  }],
  slash: true,
  guildOnly: true,
  permissions: ['MANAGE_MESSAGES']
});

// Timeout command
bot.command('timeout', async (ctx) => {
  const member = ctx.getMember('user');
  const duration = ctx.getOption('duration') || '10m';
  const reason = ctx.getOption('reason') || 'No reason provided';
  
  if (!member) {
    return ctx.error('❌ User not found in this server!');
  }
  
  if (!member.moderatable) {
    return ctx.error('❌ I cannot timeout this user!');
  }
  
  const time = require('./utils/time');
  const ms = time.parse(duration);
  
  if (ms === 0 || ms > 28 * 24 * 60 * 60 * 1000) { // Max 28 days
    return ctx.error('❌ Invalid duration! Use formats like: 10m, 1h, 1d (max 28 days)');
  }
  
  try {
    await member.timeout(ms, reason);
    
    const embed = ctx.embed()
      .title('⏰ User Timed Out')
      .field('User', member.user.tag)
      .field('Duration', duration)
      .field('Moderator', ctx.user.tag)
      .field('Reason', reason)
      .color('yellow')
      .timestamp();
    
    await embed.send();
    
  } catch (error) {
    console.error('Timeout error:', error);
    await ctx.error('❌ Failed to timeout user!');
  }
}, {
  description: 'Timeout a user',
  options: [
    {
      name: 'user',
      description: 'User to timeout',
      type: 6,
      required: true
    },
    {
      name: 'duration',
      description: 'Timeout duration (e.g., 10m, 1h, 1d)',
      type: 3,
      required: false
    },
    {
      name: 'reason',
      description: 'Reason for timeout',
      type: 3,
      required: false
    }
  ],
  slash: true,
  guildOnly: true,
  permissions: ['MODERATE_MEMBERS']
});

bot.start();
```

## Getting Started Tips

1. **Start Simple**: Begin with a basic ping bot and gradually add features
2. **Use Environment Variables**: Store your bot token and other secrets in `.env` files
3. **Handle Errors**: Always wrap potentially failing operations in try-catch blocks
4. **Test Commands**: Use a development server to test your bot before deploying
5. **Read the Docs**: Check the Discord.js documentation for advanced features
6. **Join Communities**: Discord bot development communities can provide help and inspiration

## Next Steps

- Explore the [Command Examples](./commands.md) for more advanced command patterns
- Learn about [Plugin Examples](./plugins.md) to modularize your bot
- Check out [Advanced Use Cases](./advanced.md) for complex bot implementations






