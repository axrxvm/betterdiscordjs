# Events

Events are the backbone of Discord bot functionality. They allow your bot to respond to various activities happening in Discord servers.

## Basic Event Handling

### Registering Events

```javascript
const { Bot } = require('@axrxvm/betterdiscordjs');
const bot = new Bot(token);

// Basic event listener
bot.on('messageCreate', (ctx) => {
  console.log(`Message received: ${ctx.content}`);
});

// One-time event listener
bot.on('ready', (ctx) => {
  console.log('Bot is ready!');
}, true); // true for once
```

### Event Context

All event handlers receive a context object (`ctx`) as their first parameter:

```javascript
bot.on('messageCreate', (ctx) => {
  // Access message properties
  console.log(ctx.content);
  console.log(ctx.author.username);
  console.log(ctx.guild?.name);
  
  // Use helper methods
  if (ctx.content === 'hello') {
    ctx.reply('Hello there!');
  }
});
```

## Common Events

### Message Events

```javascript
// When a message is created
bot.on('messageCreate', (ctx) => {
  if (ctx.author.bot) return; // Ignore bot messages
  
  // Auto-react to messages containing "good bot"
  if (ctx.content.toLowerCase().includes('good bot')) {
    ctx.react('❤️');
  }
});

// When a message is deleted
bot.on('messageDelete', (ctx) => {
  console.log(`Message deleted: ${ctx.content}`);
});

// When a message is edited
bot.on('messageUpdate', (oldMessage, newMessage) => {
  console.log(`Message edited from "${oldMessage.content}" to "${newMessage.content}"`);
});
```

### Member Events

```javascript
// When a member joins
bot.on('guildMemberAdd', (ctx) => {
  const welcomeChannel = ctx.guild.channels.cache.find(ch => ch.name === 'welcome');
  if (welcomeChannel) {
    welcomeChannel.send(`Welcome to the server, ${ctx.user}! 🎉`);
  }
});

// When a member leaves
bot.on('guildMemberRemove', (ctx) => {
  console.log(`${ctx.user.username} left the server`);
});
```

### Interaction Events

```javascript
// Handle button interactions
bot.on('interactionCreate', (ctx) => {
  if (!ctx.isButton()) return;
  
  if (ctx.customId === 'confirm_action') {
    ctx.reply('Action confirmed!');
  }
});

// Handle select menu interactions
bot.on('interactionCreate', (ctx) => {
  if (!ctx.isSelectMenu()) return;
  
  const selectedValue = ctx.values[0];
  ctx.reply(`You selected: ${selectedValue}`);
});
```

## Advanced Event Features

### Event Groups

Organize related events using groups:

```javascript
// Moderation events group
bot.on('moderation/memberBan', (ctx) => {
  // Handle member ban
});

bot.on('moderation/memberKick', (ctx) => {
  // Handle member kick
});
```

### Wildcard Event Listeners

Listen to all events:

```javascript
bot.onAny((eventName, ctx, ...args) => {
  console.log(`Event fired: ${eventName}`);
});
```

### Event Middleware

Add middleware that runs before event handlers:

```javascript
bot.beforeEvent((eventName, ctx, ...args) => {
  console.log(`About to handle: ${eventName}`);
  
  // Add custom properties to context
  ctx.timestamp = Date.now();
});
```

### Global Event Hook

Handle all events with a single handler:

```javascript
bot.onAllEvents((ctx, ...args) => {
  // Log all events to database
  logEventToDatabase(ctx.eventName, ctx.user?.id);
});
```

## Event-Driven Architecture

### Auto-Moderation Example

```javascript
bot.on('messageCreate', async (ctx) => {
  if (ctx.author.bot) return;
  
  // Check for spam
  if (await isSpam(ctx.content)) {
    await ctx.delete();
    await ctx.author.timeout(5 * 60 * 1000, 'Spam detected');
    
    // Log to moderation channel
    const modChannel = ctx.guild.channels.cache.find(ch => ch.name === 'mod-log');
    if (modChannel) {
      modChannel.send(`🚫 Spam message deleted from ${ctx.author}`);
    }
  }
});
```

### Welcome System Example

```javascript
bot.on('guildMemberAdd', async (ctx) => {
  const member = ctx;
  const guild = ctx.guild;
  
  // Send welcome DM
  try {
    await member.send(`Welcome to ${guild.name}! Please read the rules in #rules.`);
  } catch (error) {
    console.log('Could not send welcome DM');
  }
  
  // Add default role
  const defaultRole = guild.roles.cache.find(role => role.name === 'Member');
  if (defaultRole) {
    await member.roles.add(defaultRole);
  }
  
  // Update member count
  const countChannel = guild.channels.cache.find(ch => ch.name.includes('member-count'));
  if (countChannel) {
    await countChannel.setName(`Members: ${guild.memberCount}`);
  }
});
```

## File-Based Event Loading

For larger bots, organize events in separate files:

### events/ready.js
```javascript
module.exports = {
  name: 'ready',
  once: true,
  execute(ctx) {
    console.log(`Ready! Logged in as ${ctx.client.user.tag}`);
  }
};
```

### events/messageCreate.js
```javascript
module.exports = {
  name: 'messageCreate',
  execute(ctx) {
    if (ctx.author.bot) return;
    
    // Handle message logic here
  }
};
```

Then load them:

```javascript
const bot = new Bot(token, {
  eventsDir: './events'
});
```

## Error Handling

### Event Error Handling

```javascript
bot.on('messageCreate', async (ctx) => {
  try {
    // Your event logic here
    await someAsyncOperation();
  } catch (error) {
    console.error('Error in messageCreate:', error);
    
    // Optionally notify admins
    const errorChannel = ctx.guild.channels.cache.find(ch => ch.name === 'bot-errors');
    if (errorChannel) {
      errorChannel.send(`Error in messageCreate: ${error.message}`);
    }
  }
});
```

### Global Error Handler

```javascript
bot.onError((error, cmd, ctx) => {
  console.error('Global error:', error);
  
  // Log to external service
  logErrorToService(error, {
    command: cmd?.name,
    user: ctx?.user?.id,
    guild: ctx?.guild?.id
  });
});
```

## Best Practices

1. **Always check for bot messages** in messageCreate events
2. **Use try-catch blocks** for async operations
3. **Implement rate limiting** for resource-intensive events
4. **Log important events** for debugging and analytics
5. **Use event groups** to organize related functionality
6. **Handle permissions** before performing actions
7. **Validate data** before processing events

## Performance Considerations

- Use event filtering to reduce unnecessary processing
- Implement caching for frequently accessed data
- Use database transactions for related operations
- Consider using queues for heavy processing
- Monitor memory usage with large event volumes#
# Next Steps

Expand your event handling knowledge:

1. 🎯 [Commands](./commands.md) - Build interactive command systems
2. 🔧 [Middleware & Hooks](../advanced/middleware.md) - Add advanced event processing
3. 🔌 [Plugin System](../plugins/overview.md) - Create event-driven plugins
4. 📊 [Advanced Use Cases](../examples/advanced.md) - Implement complex event architectures






