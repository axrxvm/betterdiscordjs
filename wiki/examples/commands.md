# Command Examples

This section provides comprehensive examples of different types of commands you can create with @axrxvm/betterdiscordjs, from simple responses to complex interactive commands.

## Basic Commands

### Simple Response Commands

```javascript
// Basic greeting command
bot.command('hello', async (ctx) => {
  await ctx.reply(`Hello, ${ctx.user.username}! 👋`);
}, {
  description: 'Say hello to the bot'
});

// Command with arguments
bot.command('echo', async (ctx) => {
  const message = ctx.args.join(' ');
  
  if (!message) {
    return ctx.error('❌ Please provide a message to echo!');
  }
  
  await ctx.reply(message);
}, {
  description: 'Echo a message',
  usage: 'echo <message>'
});

// Command with user mention
bot.command('hug', async (ctx) => {
  const target = ctx.getMember('user') || ctx.guild.members.cache.get(ctx.args.user);
  
  if (!target) {
    return ctx.error('❌ Please mention a user to hug!');
  }
  
  if (target.id === ctx.user.id) {
    return ctx.reply('🤗 You hug yourself! Self-love is important!');
  }
  
  await ctx.reply(`🤗 ${ctx.user} hugs ${target.user}!`);
}, {
  description: 'Hug another user',
  options: [{
    name: 'user',
    description: 'User to hug',
    type: 6, // USER
    required: true
  }],
  slash: true
});
```

## Information Commands

### Server Information

```javascript
bot.command('serverinfo', async (ctx) => {
  const guild = ctx.guild;
  
  if (!guild) {
    return ctx.error('❌ This command can only be used in servers!');
  }
  
  // Get various server statistics
  const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
  const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
  const categories = guild.channels.cache.filter(c => c.type === 4).size;
  
  const embed = ctx.embed()
    .title(`📊 ${guild.name}`)
    .thumbnail(guild.iconURL({ size: 256 }))
    .field('Owner', guild.owner?.user.tag || 'Unknown', true)
    .field('Created', guild.createdAt.toDateString(), true)
    .field('Members', guild.memberCount.toString(), true)
    .field('Boost Tier', guild.premiumTier.toString(), true)
    .field('Boost Count', guild.premiumSubscriptionCount?.toString() || '0', true)
    .field('Verification Level', guild.verificationLevel.toString(), true)
    .field('Text Channels', textChannels.toString(), true)
    .field('Voice Channels', voiceChannels.toString(), true)
    .field('Categories', categories.toString(), true)
    .field('Roles', (guild.roles.cache.size - 1).toString(), true) // Exclude @everyone
    .field('Emojis', guild.emojis.cache.size.toString(), true)
    .field('Features', guild.features.length > 0 ? guild.features.join(', ') : 'None', false)
    .color('blue')
    .footer(`Server ID: ${guild.id}`)
    .timestamp();
  
  await embed.send();
}, {
  description: 'Show detailed server information',
  guildOnly: true,
  slash: true
});
```

### User Information with Advanced Features

```javascript
bot.command('whois', async (ctx) => {
  const user = ctx.getUser('user') || ctx.user;
  const member = ctx.guild?.members.cache.get(user.id);
  
  const embed = ctx.embed()
    .title(`👤 ${user.tag}`)
    .thumbnail(user.displayAvatarURL({ size: 256 }))
    .field('ID', user.id, true)
    .field('Bot', user.bot ? 'Yes' : 'No', true)
    .field('Created', user.createdAt.toDateString(), true);
  
  if (member) {
    embed
      .field('Joined Server', member.joinedAt?.toDateString() || 'Unknown', true)
      .field('Nickname', member.nickname || 'None', true)
      .field('Highest Role', member.roles.highest.name, true);
    
    // Show user permissions
    const keyPerms = member.permissions.toArray().filter(perm => 
      ['ADMINISTRATOR', 'MANAGE_GUILD', 'MANAGE_CHANNELS', 'MANAGE_MESSAGES', 
       'KICK_MEMBERS', 'BAN_MEMBERS', 'MODERATE_MEMBERS'].includes(perm)
    );
    
    if (keyPerms.length > 0) {
      embed.field('Key Permissions', keyPerms.join(', '), false);
    }
    
    // Show roles (limit to prevent embed overflow)
    const roles = member.roles.cache
      .filter(role => role.id !== ctx.guild.id) // Exclude @everyone
      .sort((a, b) => b.position - a.position)
      .map(role => role.toString())
      .slice(0, 10); // Limit to 10 roles
    
    if (roles.length > 0) {
      embed.field(`Roles [${member.roles.cache.size - 1}]`, 
        roles.join(' ') + (member.roles.cache.size > 11 ? ' ...' : ''), false);
    }
    
    embed.color(member.displayHexColor || 'blue');
  }
  
  await embed.send();
}, {
  description: 'Show detailed user information',
  options: [{
    name: 'user',
    description: 'User to show information for',
    type: 6,
    required: false
  }],
  slash: true
});
```

## Interactive Commands

### Multi-Step Setup Command

```javascript
bot.command('setup', async (ctx) => {
  if (!ctx.member.permissions.has('ADMINISTRATOR')) {
    return ctx.error('❌ You need Administrator permissions to use this command!');
  }
  
  const steps = [
    'What should be the welcome channel? (mention a channel or type "skip")',
    'What should be the log channel? (mention a channel or type "skip")',
    'What should be the default role for new members? (mention a role or type "skip")',
    'Should I enable auto-moderation? (yes/no)'
  ];
  
  const answers = await ctx.dialog(steps, { timeout: 60000 });
  
  if (answers.length < steps.length) {
    return ctx.error('❌ Setup cancelled or timed out.');
  }
  
  const config = {
    welcomeChannel: null,
    logChannel: null,
    defaultRole: null,
    autoMod: false
  };
  
  // Process welcome channel
  if (answers[0] !== 'skip') {
    const channelMatch = answers[0].match(/<#(\d+)>/);
    if (channelMatch) {
      const channel = ctx.guild.channels.cache.get(channelMatch[1]);
      if (channel) config.welcomeChannel = channel.id;
    }
  }
  
  // Process log channel
  if (answers[1] !== 'skip') {
    const channelMatch = answers[1].match(/<#(\d+)>/);
    if (channelMatch) {
      const channel = ctx.guild.channels.cache.get(channelMatch[1]);
      if (channel) config.logChannel = channel.id;
    }
  }
  
  // Process default role
  if (answers[2] !== 'skip') {
    const roleMatch = answers[2].match(/<@&(\d+)>/);
    if (roleMatch) {
      const role = ctx.guild.roles.cache.get(roleMatch[1]);
      if (role) config.defaultRole = role.id;
    }
  }
  
  // Process auto-moderation
  config.autoMod = answers[3].toLowerCase() === 'yes';
  
  // Save configuration
  const db = require('./utils/db');
  await db.setGuildConfig(ctx.guild.id, 'setup', config);
  
  const embed = ctx.embed()
    .title('✅ Setup Complete!')
    .field('Welcome Channel', config.welcomeChannel ? `<#${config.welcomeChannel}>` : 'Not set')
    .field('Log Channel', config.logChannel ? `<#${config.logChannel}>` : 'Not set')
    .field('Default Role', config.defaultRole ? `<@&${config.defaultRole}>` : 'Not set')
    .field('Auto-Moderation', config.autoMod ? 'Enabled' : 'Disabled')
    .color('green');
  
  await embed.send();
}, {
  description: 'Set up the bot for this server',
  guildOnly: true,
  permissions: ['ADMINISTRATOR']
});
```

### Poll Command with Reactions

```javascript
bot.command('poll', async (ctx) => {
  const question = ctx.getOption('question');
  const options = ctx.getOption('options')?.split(',').map(opt => opt.trim()) || [];
  const duration = ctx.getOption('duration') || '5m';
  
  if (!question) {
    return ctx.error('❌ Please provide a question for the poll!');
  }
  
  // Default yes/no poll if no options provided
  if (options.length === 0) {
    const embed = ctx.embed()
      .title('📊 Poll')
      .desc(question)
      .footer(`Poll by ${ctx.user.tag} • React to vote!`)
      .color('blue');
    
    const msg = await ctx.reply({ embeds: [embed.embed] });
    
    await msg.react('👍');
    await msg.react('👎');
    
    // End poll after duration
    const time = require('./utils/time');
    const ms = time.parse(duration);
    
    setTimeout(async () => {
      try {
        const updatedMsg = await msg.fetch();
        const yesReaction = updatedMsg.reactions.cache.get('👍');
        const noReaction = updatedMsg.reactions.cache.get('👎');
        
        const yesCount = (yesReaction?.count || 1) - 1; // Subtract bot's reaction
        const noCount = (noReaction?.count || 1) - 1;
        
        const resultEmbed = ctx.embed()
          .title('📊 Poll Results')
          .desc(question)
          .field('👍 Yes', yesCount.toString(), true)
          .field('👎 No', noCount.toString(), true)
          .field('Total Votes', (yesCount + noCount).toString(), true)
          .color('green')
          .footer('Poll ended');
        
        await updatedMsg.edit({ embeds: [resultEmbed.embed] });
      } catch (error) {
        console.error('Poll end error:', error);
      }
    }, ms);
    
    return;
  }
  
  // Multi-option poll
  if (options.length > 10) {
    return ctx.error('❌ Maximum 10 options allowed!');
  }
  
  const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
  
  const embed = ctx.embed()
    .title('📊 Poll')
    .desc(question)
    .color('blue')
    .footer(`Poll by ${ctx.user.tag} • React to vote!`);
  
  options.forEach((option, index) => {
    embed.field(`${emojis[index]} Option ${index + 1}`, option, true);
  });
  
  const msg = await ctx.reply({ embeds: [embed.embed] });
  
  // Add reactions for each option
  for (let i = 0; i < options.length; i++) {
    await msg.react(emojis[i]);
  }
}, {
  description: 'Create a poll',
  options: [
    {
      name: 'question',
      description: 'The poll question',
      type: 3,
      required: true
    },
    {
      name: 'options',
      description: 'Poll options separated by commas (optional for yes/no poll)',
      type: 3,
      required: false
    },
    {
      name: 'duration',
      description: 'Poll duration (e.g., 5m, 1h)',
      type: 3,
      required: false
    }
  ],
  slash: true
});
```

## Utility Commands

### Advanced Calculator

```javascript
bot.command('calc', async (ctx) => {
  const expression = ctx.getOption('expression') || ctx.args.join(' ');
  
  if (!expression) {
    return ctx.error('❌ Please provide a mathematical expression!');
  }
  
  try {
    // Simple math evaluation (be careful with eval in production!)
    // This is a simplified example - use a proper math parser in production
    const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
    
    if (sanitized !== expression) {
      return ctx.error('❌ Invalid characters in expression! Only numbers and +, -, *, /, () are allowed.');
    }
    
    const result = Function(`"use strict"; return (${sanitized})`)();
    
    if (!isFinite(result)) {
      return ctx.error('❌ Result is not a finite number!');
    }
    
    const embed = ctx.embed()
      .title('🧮 Calculator')
      .field('Expression', `\`${expression}\``)
      .field('Result', `\`${result}\``)
      .color('green');
    
    await embed.send();
    
  } catch (error) {
    await ctx.error('❌ Invalid mathematical expression!');
  }
}, {
  description: 'Calculate a mathematical expression',
  options: [{
    name: 'expression',
    description: 'Mathematical expression to calculate',
    type: 3,
    required: true
  }],
  slash: true
});
```

### Color Command

```javascript
bot.command('color', async (ctx) => {
  const colorInput = ctx.getOption('color') || ctx.args[0];
  
  if (!colorInput) {
    return ctx.error('❌ Please provide a color! (hex, rgb, or color name)');
  }
  
  let color;
  let colorName = colorInput;
  
  // Handle different color formats
  if (colorInput.startsWith('#')) {
    // Hex color
    color = parseInt(colorInput.slice(1), 16);
    if (isNaN(color)) {
      return ctx.error('❌ Invalid hex color!');
    }
  } else if (colorInput.startsWith('rgb(')) {
    // RGB color
    const rgbMatch = colorInput.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!rgbMatch) {
      return ctx.error('❌ Invalid RGB format! Use: rgb(255, 255, 255)');
    }
    
    const [, r, g, b] = rgbMatch.map(Number);
    if (r > 255 || g > 255 || b > 255) {
      return ctx.error('❌ RGB values must be between 0 and 255!');
    }
    
    color = (r << 16) + (g << 8) + b;
    colorName = `rgb(${r}, ${g}, ${b})`;
  } else {
    // Named colors
    const namedColors = {
      red: 0xFF0000, green: 0x00FF00, blue: 0x0000FF,
      yellow: 0xFFFF00, purple: 0x800080, orange: 0xFFA500,
      pink: 0xFFC0CB, cyan: 0x00FFFF, lime: 0x00FF00,
      magenta: 0xFF00FF, brown: 0xA52A2A, black: 0x000000,
      white: 0xFFFFFF, gray: 0x808080, silver: 0xC0C0C0
    };
    
    color = namedColors[colorInput.toLowerCase()];
    if (color === undefined) {
      return ctx.error('❌ Unknown color name! Try hex (#FF0000) or RGB format.');
    }
  }
  
  // Convert to RGB components
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;
  
  const embed = ctx.embed()
    .title('🎨 Color Information')
    .field('Color', colorName, true)
    .field('Hex', `#${color.toString(16).padStart(6, '0').toUpperCase()}`, true)
    .field('RGB', `rgb(${r}, ${g}, ${b})`, true)
    .field('Decimal', color.toString(), true)
    .color(color);
  
  await embed.send();
}, {
  description: 'Show information about a color',
  options: [{
    name: 'color',
    description: 'Color in hex (#FF0000), RGB (rgb(255,0,0)), or name (red)',
    type: 3,
    required: true
  }],
  slash: true
});
```

## Fun Commands

### Rock Paper Scissors

```javascript
bot.command('rps', async (ctx) => {
  const userChoice = ctx.getOption('choice')?.toLowerCase();
  const validChoices = ['rock', 'paper', 'scissors'];
  
  if (!userChoice || !validChoices.includes(userChoice)) {
    return ctx.error('❌ Please choose rock, paper, or scissors!');
  }
  
  const botChoice = ctx.randomChoice(validChoices);
  const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
  
  let result;
  if (userChoice === botChoice) {
    result = "It's a tie!";
  } else if (
    (userChoice === 'rock' && botChoice === 'scissors') ||
    (userChoice === 'paper' && botChoice === 'rock') ||
    (userChoice === 'scissors' && botChoice === 'paper')
  ) {
    result = 'You win! 🎉';
  } else {
    result = 'I win! 😄';
  }
  
  const embed = ctx.embed()
    .title('🎮 Rock Paper Scissors')
    .field('Your Choice', `${emojis[userChoice]} ${userChoice}`, true)
    .field('My Choice', `${emojis[botChoice]} ${botChoice}`, true)
    .field('Result', result, false)
    .color(result.includes('You win') ? 'green' : result.includes('tie') ? 'yellow' : 'red');
  
  await embed.send();
}, {
  description: 'Play rock paper scissors',
  options: [{
    name: 'choice',
    description: 'Your choice',
    type: 3,
    required: true,
    choices: [
      { name: 'Rock', value: 'rock' },
      { name: 'Paper', value: 'paper' },
      { name: 'Scissors', value: 'scissors' }
    ]
  }],
  slash: true
});
```

### Trivia Command

```javascript
bot.command('trivia', async (ctx) => {
  const questions = [
    {
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correct: 2
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correct: 1
    },
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      correct: 1
    }
    // Add more questions...
  ];
  
  const question = ctx.randomChoice(questions);
  const emojis = ['🇦', '🇧', '🇨', '🇩'];
  
  const embed = ctx.embed()
    .title('🧠 Trivia Question')
    .desc(question.question)
    .color('blue');
  
  question.options.forEach((option, index) => {
    embed.field(`${emojis[index]} ${String.fromCharCode(65 + index)}`, option, true);
  });
  
  const msg = await ctx.reply({ embeds: [embed.embed] });
  
  // Add reaction options
  for (let i = 0; i < question.options.length; i++) {
    await msg.react(emojis[i]);
  }
  
  // Wait for user reaction
  const filter = (reaction, user) => {
    return emojis.includes(reaction.emoji.name) && user.id === ctx.user.id;
  };
  
  try {
    const collected = await msg.awaitReactions({ filter, max: 1, time: 30000, errors: ['time'] });
    const reaction = collected.first();
    const userAnswer = emojis.indexOf(reaction.emoji.name);
    
    const isCorrect = userAnswer === question.correct;
    const resultEmbed = ctx.embed()
      .title(isCorrect ? '✅ Correct!' : '❌ Wrong!')
      .desc(question.question)
      .field('Your Answer', `${emojis[userAnswer]} ${question.options[userAnswer]}`)
      .field('Correct Answer', `${emojis[question.correct]} ${question.options[question.correct]}`)
      .color(isCorrect ? 'green' : 'red');
    
    await msg.edit({ embeds: [resultEmbed.embed] });
    
  } catch (error) {
    const timeoutEmbed = ctx.embed()
      .title('⏰ Time\'s Up!')
      .desc(question.question)
      .field('Correct Answer', `${emojis[question.correct]} ${question.options[question.correct]}`)
      .color('orange');
    
    await msg.edit({ embeds: [timeoutEmbed.embed] });
  }
}, {
  description: 'Answer a trivia question',
  slash: true,
  cooldown: '10s'
});
```

## Advanced Commands

### Command with Subcommands

```javascript
// Main command handler
bot.command('config', async (ctx) => {
  const subcommand = ctx.getOption('subcommand') || ctx.args[0];
  
  switch (subcommand) {
    case 'show':
      await showConfig(ctx);
      break;
    case 'set':
      await setConfig(ctx);
      break;
    case 'reset':
      await resetConfig(ctx);
      break;
    default:
      await ctx.error('❌ Invalid subcommand! Use: show, set, or reset');
  }
}, {
  description: 'Manage server configuration',
  guildOnly: true,
  permissions: ['MANAGE_GUILD']
});

async function showConfig(ctx) {
  const db = require('./utils/db');
  const config = await db.getGuildConfig(ctx.guild.id, 'settings', {});
  
  const embed = ctx.embed()
    .title('⚙️ Server Configuration')
    .field('Prefix', config.prefix || '!', true)
    .field('Welcome Channel', config.welcomeChannel ? `<#${config.welcomeChannel}>` : 'Not set', true)
    .field('Log Channel', config.logChannel ? `<#${config.logChannel}>` : 'Not set', true)
    .field('Auto Role', config.autoRole ? `<@&${config.autoRole}>` : 'Not set', true)
    .field('Auto Moderation', config.autoMod ? 'Enabled' : 'Disabled', true)
    .color('blue');
  
  await embed.send();
}

async function setConfig(ctx) {
  const setting = ctx.getOption('setting') || ctx.args[1];
  const value = ctx.getOption('value') || ctx.args.slice(2).join(' ');
  
  if (!setting || !value) {
    return ctx.error('❌ Usage: config set <setting> <value>');
  }
  
  const db = require('./utils/db');
  const validSettings = ['prefix', 'welcomeChannel', 'logChannel', 'autoRole', 'autoMod'];
  
  if (!validSettings.includes(setting)) {
    return ctx.error(`❌ Invalid setting! Valid settings: ${validSettings.join(', ')}`);
  }
  
  // Process different setting types
  let processedValue = value;
  
  if (setting.includes('Channel')) {
    const channelMatch = value.match(/<#(\d+)>/);
    if (channelMatch) {
      const channel = ctx.guild.channels.cache.get(channelMatch[1]);
      if (!channel) {
        return ctx.error('❌ Channel not found!');
      }
      processedValue = channel.id;
    } else {
      return ctx.error('❌ Please mention a valid channel!');
    }
  } else if (setting === 'autoRole') {
    const roleMatch = value.match(/<@&(\d+)>/);
    if (roleMatch) {
      const role = ctx.guild.roles.cache.get(roleMatch[1]);
      if (!role) {
        return ctx.error('❌ Role not found!');
      }
      processedValue = role.id;
    } else {
      return ctx.error('❌ Please mention a valid role!');
    }
  } else if (setting === 'autoMod') {
    processedValue = ['true', 'yes', 'on', 'enable'].includes(value.toLowerCase());
  }
  
  await db.setGuildConfig(ctx.guild.id, `settings.${setting}`, processedValue);
  
  await ctx.success(`✅ Set ${setting} to ${value}`);
}

async function resetConfig(ctx) {
  const db = require('./utils/db');
  await db.setGuildConfig(ctx.guild.id, 'settings', {});
  
  await ctx.success('✅ Configuration reset to defaults!');
}
```

## Best Practices for Commands

1. **Always validate input**
   ```javascript
   if (!input || input.length === 0) {
     return ctx.error('❌ Please provide valid input!');
   }
   ```

2. **Use appropriate permissions**
   ```javascript
   bot.command('modcommand', handler, {
     permissions: ['MANAGE_MESSAGES'],
     guildOnly: true
   });
   ```

3. **Handle errors gracefully**
   ```javascript
   try {
     await riskyOperation();
   } catch (error) {
     console.error('Command error:', error);
     await ctx.error('❌ Something went wrong!');
   }
   ```

4. **Provide helpful descriptions**
   ```javascript
   bot.command('complex', handler, {
     description: 'A complex command that does X, Y, and Z',
     usage: 'complex <required> [optional]',
     examples: ['complex hello', 'complex hello world']
   });
   ```

5. **Use cooldowns for resource-intensive commands**
   ```javascript
   bot.command('heavy', handler, {
     cooldown: '30s',
     description: 'A resource-intensive command'
   });
   ```##
 Next Steps

Build more sophisticated commands:

1. 🎮 [Component Interactions](../advanced/components.md) - Add interactive elements
2. 🎨 [Embed Builder](../advanced/embed-builder.md) - Create rich command responses
3. 🔧 [Middleware & Hooks](../advanced/middleware.md) - Add command preprocessing
4. 📊 [Advanced Use Cases](./advanced.md) - Implement complex command systems






