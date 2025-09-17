# Commands

@axrxvm/betterdiscordjs provides a powerful and flexible command system that supports both prefix commands and slash commands with a unified API.

## Command Types

### 1. Inline Commands

Quick commands defined directly in your main bot file:

```javascript
bot.command('ping', async (ctx) => {
  await ctx.reply('Pong!');
}, {
  description: 'Check bot latency',
  slash: true
});
```

### 2. File-Based Commands

Commands organized in separate files for better structure:

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
    const latency = Date.now() - start;
    
    const embed = ctx.embed()
      .title('🏓 Pong!')
      .field('Bot Latency', `${latency}ms`, true)
      .field('API Latency', `${ctx.client.ws.ping}ms`, true)
      .color('green');
    
    await msg.edit({ embeds: [embed.embed] });
  }
};
```

### 3. Plugin Commands

Commands defined within plugins:

```javascript
class MyPlugin extends BasePlugin {
  async onLoad() {
    this.addCommand('myplugin', this.myCommand.bind(this), {
      description: 'My plugin command',
      slash: true
    });
  }
  
  async myCommand(ctx) {
    await ctx.reply('Hello from my plugin!');
  }
}
```

## Command Structure

### Basic Command Properties

```javascript
module.exports = {
  name: 'commandname',           // Command name (required)
  description: 'Description',    // Command description
  category: 'General',           // Command category
  aliases: ['alias1', 'alias2'], // Command aliases
  usage: 'command <arg>',        // Usage example
  examples: ['!command hello'],  // Usage examples
  
  // Command options
  slash: true,                   // Enable as slash command
  guildOnly: true,              // Guild-only command
  devOnly: false,               // Developer-only command
  nsfwOnly: false,              // NSFW-only command
  cooldown: '5s',               // Cooldown duration
  permissions: ['Administrator'], // Required permissions
  
  // Slash command options
  options: [
    {
      name: 'user',
      description: 'Target user',
      type: 6, // USER
      required: true
    }
  ],
  
  async run(ctx) {
    // Command logic here
  }
};
```

### Command Options Reference

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Command name (required) |
| `description` | string | Command description |
| `category` | string | Command category for organization |
| `aliases` | array | Alternative command names |
| `usage` | string | Usage syntax |
| `examples` | array | Usage examples |
| `slash` | boolean | Enable as slash command |
| `guildOnly` | boolean | Restrict to guilds only |
| `devOnly` | boolean | Developer-only command |
| `nsfwOnly` | boolean | NSFW channels only |
| `cooldown` | string | Cooldown duration (e.g., '5s', '1m') |
| `permissions` | array | Required Discord permissions |
| `options` | array | Slash command options |

## Slash Command Options

### Option Types

```javascript
options: [
  {
    name: 'string_option',
    description: 'A string input',
    type: 3, // STRING
    required: true,
    choices: [
      { name: 'Choice 1', value: 'choice1' },
      { name: 'Choice 2', value: 'choice2' }
    ]
  },
  {
    name: 'integer_option',
    description: 'A number input',
    type: 4, // INTEGER
    required: false,
    min_value: 1,
    max_value: 100
  },
  {
    name: 'user_option',
    description: 'Select a user',
    type: 6, // USER
    required: true
  },
  {
    name: 'channel_option',
    description: 'Select a channel',
    type: 7, // CHANNEL
    required: false,
    channel_types: [0, 2] // Text and voice channels
  },
  {
    name: 'role_option',
    description: 'Select a role',
    type: 8, // ROLE
    required: false
  },
  {
    name: 'boolean_option',
    description: 'True or false',
    type: 5, // BOOLEAN
    required: false
  }
]
```

### Option Type Constants

| Type | Number | Description |
|------|--------|-------------|
| SUB_COMMAND | 1 | Subcommand |
| SUB_COMMAND_GROUP | 2 | Subcommand group |
| STRING | 3 | String input |
| INTEGER | 4 | Integer input |
| BOOLEAN | 5 | Boolean input |
| USER | 6 | User selection |
| CHANNEL | 7 | Channel selection |
| ROLE | 8 | Role selection |
| MENTIONABLE | 9 | User or role |
| NUMBER | 10 | Decimal number |
| ATTACHMENT | 11 | File attachment |

## Command Examples

### Basic Commands

#### Simple Text Response

```javascript
module.exports = {
  name: 'hello',
  description: 'Say hello',
  slash: true,
  
  async run(ctx) {
    await ctx.reply(`Hello, ${ctx.user.username}! 👋`);
  }
};
```

#### Command with Arguments

```javascript
module.exports = {
  name: 'say',
  description: 'Make the bot say something',
  usage: 'say <message>',
  permissions: ['ManageMessages'],
  
  async run(ctx) {
    if (!ctx.args.length) {
      return ctx.error('Please provide a message to say!');
    }
    
    const message = ctx.args.join(' ');
    await ctx.reply(message);
    
    // Delete the original command message
    if (!ctx.isInteraction) {
      await ctx.delete();
    }
  }
};
```

### Advanced Commands

#### User Information Command

```javascript
module.exports = {
  name: 'userinfo',
  description: 'Get information about a user',
  category: 'Utility',
  slash: true,
  options: [
    {
      name: 'user',
      description: 'The user to get info about',
      type: 6, // USER
      required: false
    }
  ],
  
  async run(ctx) {
    // Get target user (from slash command option or mention)
    const target = ctx.getUser('user') || 
                   (ctx.args[0] ? await ctx.fetchUser(ctx.args[0].replace(/[<@!>]/g, '')) : null) ||
                   ctx.user;
    
    if (!target) {
      return ctx.error('User not found!');
    }
    
    const member = ctx.guild ? await ctx.guild.members.fetch(target.id).catch(() => null) : null;
    
    const embed = ctx.embed()
      .title(`👤 ${target.username}`)
      .thumbnail(target.displayAvatarURL({ size: 256 }))
      .field('ID', target.id, true)
      .field('Created', target.createdAt.toDateString(), true);
    
    if (member) {
      embed
        .field('Joined', member.joinedAt.toDateString(), true)
        .field('Roles', member.roles.cache.size.toString(), true)
        .field('Nickname', member.nickname || 'None', true);
    }
    
    embed.color('blue').timestamp();
    
    await embed.send();
  }
};
```

#### Poll Command with Interactions

```javascript
module.exports = {
  name: 'poll',
  description: 'Create a poll',
  category: 'Utility',
  usage: 'poll <question> | <option1> | <option2> | [option3] | [option4] | [option5]',
  slash: true,
  options: [
    {
      name: 'question',
      description: 'The poll question',
      type: 3, // STRING
      required: true
    },
    {
      name: 'option1',
      description: 'First option',
      type: 3, // STRING
      required: true
    },
    {
      name: 'option2',
      description: 'Second option',
      type: 3, // STRING
      required: true
    },
    {
      name: 'option3',
      description: 'Third option',
      type: 3, // STRING
      required: false
    },
    {
      name: 'option4',
      description: 'Fourth option',
      type: 3, // STRING
      required: false
    },
    {
      name: 'option5',
      description: 'Fifth option',
      type: 3, // STRING
      required: false
    }
  ],
  
  async run(ctx) {
    let question, options;
    
    if (ctx.isInteraction) {
      // Handle slash command
      question = ctx.getOption('question');
      options = [
        ctx.getOption('option1'),
        ctx.getOption('option2'),
        ctx.getOption('option3'),
        ctx.getOption('option4'),
        ctx.getOption('option5')
      ].filter(Boolean);
    } else {
      // Handle prefix command
      const args = ctx.args.join(' ').split('|').map(s => s.trim());
      if (args.length < 3) {
        return ctx.error('Usage: `poll <question> | <option1> | <option2> | [option3] | [option4] | [option5]`');
      }
      question = args[0];
      options = args.slice(1);
    }
    
    if (options.length < 2 || options.length > 5) {
      return ctx.error('Please provide 2-5 options for the poll.');
    }
    
    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
    
    const embed = ctx.embed()
      .title('📊 Poll')
      .desc(`**${question}**\n\n${options.map((opt, i) => `${emojis[i]} ${opt}`).join('\n')}`)
      .footer('React to vote!')
      .color('blue');
    
    const msg = await embed.send();
    
    // Add reactions
    for (let i = 0; i < options.length; i++) {
      await msg.react(emojis[i]);
    }
  }
};
```

### Moderation Commands

#### Ban Command

```javascript
module.exports = {
  name: 'ban',
  description: 'Ban a user from the server',
  category: 'Moderation',
  guildOnly: true,
  permissions: ['BanMembers'],
  slash: true,
  options: [
    {
      name: 'user',
      description: 'User to ban',
      type: 6, // USER
      required: true
    },
    {
      name: 'reason',
      description: 'Reason for the ban',
      type: 3, // STRING
      required: false
    },
    {
      name: 'days',
      description: 'Days of messages to delete (0-7)',
      type: 4, // INTEGER
      required: false,
      min_value: 0,
      max_value: 7
    }
  ],
  
  async run(ctx) {
    const target = ctx.getUser('user') || 
                   (ctx.args[0] ? await ctx.fetchUser(ctx.args[0].replace(/[<@!>]/g, '')) : null);
    
    if (!target) {
      return ctx.error('Please specify a valid user to ban!');
    }
    
    const reason = ctx.getOption('reason') || ctx.args.slice(1).join(' ') || 'No reason provided';
    const deleteMessageDays = ctx.getOption('days') || 0;
    
    // Check if user can be banned
    const member = await ctx.guild.members.fetch(target.id).catch(() => null);
    if (member) {
      if (member.roles.highest.position >= ctx.member.roles.highest.position) {
        return ctx.error('You cannot ban this user due to role hierarchy!');
      }
      
      if (!member.bannable) {
        return ctx.error('I cannot ban this user!');
      }
    }
    
    try {
      await ctx.guild.members.ban(target.id, {
        reason: `${ctx.user.tag}: ${reason}`,
        deleteMessageDays
      });
      
      const embed = ctx.embed()
        .title('🔨 User Banned')
        .field('User', `${target.tag} (${target.id})`, true)
        .field('Moderator', ctx.user.tag, true)
        .field('Reason', reason, false)
        .color('red')
        .timestamp();
      
      await embed.send();
      
      // Log to moderation channel
      const logChannel = ctx.guild.channels.cache.find(c => c.name === 'mod-logs');
      if (logChannel) {
        await logChannel.send({ embeds: [embed.embed] });
      }
      
    } catch (error) {
      console.error('Ban error:', error);
      await ctx.error('Failed to ban the user. Please check my permissions.');
    }
  }
};
```

## Command Organization

### Directory Structure

```
commands/
├── general/
│   ├── ping.js
│   ├── help.js
│   └── userinfo.js
├── moderation/
│   ├── ban.js
│   ├── kick.js
│   └── mute.js
├── fun/
│   ├── 8ball.js
│   ├── dice.js
│   └── meme.js
└── utility/
    ├── poll.js
    ├── remind.js
    └── weather.js
```

### Category-Based Help System

```javascript
// commands/general/help.js
module.exports = {
  name: 'help',
  description: 'Show available commands',
  slash: true,
  options: [
    {
      name: 'command',
      description: 'Get help for a specific command',
      type: 3, // STRING
      required: false
    }
  ],
  
  async run(ctx) {
    const commandName = ctx.getOption('command') || ctx.args[0];
    
    if (commandName) {
      // Show specific command help
      const command = ctx.bot.commands.get(commandName) || 
                     ctx.bot.commands.get(ctx.bot.aliases.get(commandName));
      
      if (!command) {
        return ctx.error('Command not found!');
      }
      
      const embed = ctx.embed()
        .title(`📖 Help: ${command.name}`)
        .desc(command.description || 'No description available')
        .field('Usage', command.usage || `${ctx.bot.prefix}${command.name}`, false)
        .field('Category', command.category || 'Uncategorized', true)
        .field('Cooldown', command.cooldown || 'None', true);
      
      if (command.aliases?.length) {
        embed.field('Aliases', command.aliases.join(', '), true);
      }
      
      if (command.examples?.length) {
        embed.field('Examples', command.examples.join('\n'), false);
      }
      
      embed.color('blue');
      await embed.send();
      
    } else {
      // Show command categories
      const categories = {};
      
      ctx.bot.commands.forEach(cmd => {
        const category = cmd.category || 'Uncategorized';
        if (!categories[category]) categories[category] = [];
        categories[category].push(cmd.name);
      });
      
      const embed = ctx.embed()
        .title('📚 Command Help')
        .desc(`Use \`${ctx.bot.prefix}help <command>\` for detailed help on a specific command.`);
      
      Object.entries(categories).forEach(([category, commands]) => {
        embed.field(category, commands.join(', '), false);
      });
      
      embed.color('blue');
      await embed.send();
    }
  }
};
```

## Command Middleware

### Before/After Hooks

```javascript
// Global command hooks
bot.beforeCommand(async (cmd, ctx) => {
  console.log(`Executing command: ${cmd.name}`);
  
  // Add typing indicator
  if (!ctx.isInteraction) {
    await ctx.channel.sendTyping();
  }
});

bot.afterCommand(async (cmd, ctx) => {
  console.log(`Finished command: ${cmd.name}`);
  
  // Log command usage
  const db = require('../utils/db');
  await db.setUserConfig(ctx.user.id, 'lastCommand', {
    name: cmd.name,
    timestamp: Date.now()
  });
});
```

### Per-Command Middleware

```javascript
module.exports = {
  name: 'example',
  description: 'Example with middleware',
  
  // Before middleware
  async before(ctx) {
    console.log('Before command execution');
    await ctx.channel.sendTyping();
  },
  
  // After middleware
  async after(ctx) {
    console.log('After command execution');
  },
  
  // Error middleware
  async onError(error, ctx) {
    console.error('Command-specific error:', error);
    await ctx.error('This command encountered an error!');
  },
  
  async run(ctx) {
    await ctx.reply('Command executed!');
  }
};
```

## Command Validation

### Input Validation

```javascript
module.exports = {
  name: 'setage',
  description: 'Set your age',
  
  async run(ctx) {
    const age = parseInt(ctx.args[0]);
    
    // Validate input
    if (!age || isNaN(age)) {
      return ctx.error('Please provide a valid age number!');
    }
    
    if (age < 13 || age > 120) {
      return ctx.error('Age must be between 13 and 120!');
    }
    
    // Save age
    const db = require('../utils/db');
    await db.setUserConfig(ctx.user.id, 'age', age);
    
    await ctx.success(`Your age has been set to ${age}!`);
  }
};
```

### Permission Validation

```javascript
module.exports = {
  name: 'purge',
  description: 'Delete multiple messages',
  permissions: ['ManageMessages'],
  guildOnly: true,
  
  async run(ctx) {
    // Additional permission check
    if (!ctx.channel.permissionsFor(ctx.client.user).has('ManageMessages')) {
      return ctx.error('I need Manage Messages permission in this channel!');
    }
    
    const amount = parseInt(ctx.args[0]);
    
    if (!amount || amount < 1 || amount > 100) {
      return ctx.error('Please provide a number between 1 and 100!');
    }
    
    try {
      const deleted = await ctx.channel.bulkDelete(amount, true);
      await ctx.success(`Deleted ${deleted.size} messages!`);
    } catch (error) {
      await ctx.error('Failed to delete messages. They might be too old.');
    }
  }
};
```

## Best Practices

### 1. Error Handling

```javascript
async run(ctx) {
  try {
    // Command logic
    await someAsyncOperation();
    await ctx.success('Operation completed!');
  } catch (error) {
    console.error('Command error:', error);
    await ctx.error('Something went wrong!');
  }
}
```

### 2. Input Validation

```javascript
async run(ctx) {
  // Validate required arguments
  if (!ctx.args.length) {
    return ctx.error('Please provide the required arguments!');
  }
  
  // Validate argument format
  const userId = ctx.args[0];
  if (!/^\d{17,19}$/.test(userId)) {
    return ctx.error('Invalid user ID format!');
  }
  
  // Continue with command logic
}
```

### 3. Permission Checks

```javascript
async run(ctx) {
  // Check user permissions
  if (!ctx.hasPerms(['Administrator'])) {
    return ctx.error('You need Administrator permission!');
  }
  
  // Check bot permissions
  if (!ctx.guild.members.me.permissions.has('BanMembers')) {
    return ctx.error('I need Ban Members permission!');
  }
  
  // Continue with command logic
}
```

### 4. Consistent Response Format

```javascript
// Use appropriate response methods
await ctx.success('Operation successful!');
await ctx.error('Something went wrong!');
await ctx.info('Here is some information.');
await ctx.warn('This action cannot be undone!');
```

## Next Steps

- 📡 Learn about [Events](./events.md)
- 🎨 Master the [Embed Builder](../advanced/embed-builder.md)
- 🔧 Explore [Interactive Components](../advanced/components.md)
- 📦 Try the [Plugin System](../plugins/overview.md)

---

The @axrxvm/betterdiscordjs command system provides everything you need to build powerful, interactive Discord bots with clean, maintainable code.






