# Enhanced Features & Modular Architecture

## Overview

BetterDiscord.js has been completely overhauled with a modular architecture, enhanced Discord.js API coverage, and powerful new features for building sophisticated bots.

## 🎯 Key Improvements

### 1. **Modular Architecture**

The framework now uses specialized managers for different concerns:

- **CommandManager**: Handles all command registration, execution, and management
- **EventManager**: Manages Discord events and custom event handling
- **InteractionManager**: Dedicated manager for slash commands, buttons, select menus, and modals

### 2. **Enhanced Context (Ctx) System**

The Context object now provides **100+ methods** covering almost every Discord.js feature:

```typescript
// Message operations
ctx.reply('Hello!');
ctx.ephemeral('Secret message'); // Slash commands only
ctx.sendFiles([attachment1, attachment2]);
ctx.typing();

// Moderation
await ctx.timeout(member, 60000, 'Spamming');
await ctx.kick(member, 'Rule violation');
await ctx.ban(userId, { reason: 'Ban reason', days: 7 });

// Threads
const thread = await ctx.createThread('Discussion');

// Webhooks
const webhook = await ctx.createWebhook('Bot Webhook');
await ctx.webhookSend(webhook, 'Message via webhook');

// Bulk operations
await ctx.bulkDelete(100, true); // Delete last 100 bot messages

// And much more...
```

### 3. **Component Builders**

Fluent API for creating Discord components:

```javascript
const { ComponentBuilder } = require('@axrxvm/betterdiscordjs');

// Create a button
const button = ComponentBuilder.button()
  .label('Click Me')
  .style('primary')
  .id('my_button')
  .emoji('👍')
  .build();

// Create a select menu
const menu = ComponentBuilder.selectMenu('string')
  .id('my_menu')
  .placeholder('Choose an option')
  .option('Option 1', 'opt1', 'First option')
  .option('Option 2', 'opt2', 'Second option')
  .min(1)
  .max(1)
  .build();

// Create a row
const row = ComponentBuilder.row()
  .button(btn => btn.label('Button 1').style('success').id('btn1'))
  .button(btn => btn.label('Button 2').style('danger').id('btn2'))
  .build();
```

### 4. **Context Methods for Components**

Quick component creation within commands:

```javascript
bot.command('vote', async (ctx) => {
  const row = ctx.newRow()
    .button(ctx.newButton().label('Yes ✅').style('success').id('vote_yes'))
    .button(ctx.newButton().label('No ❌').style('danger').id('vote_no'))
    .build();
    
  await ctx.reply({
    content: 'Vote on this proposal:',
    components: [row]
  });
});
```

## 📋 Complete Context API

### Message Operations

```javascript
// Send messages
ctx.reply('Hello!');
ctx.send('Direct send');
ctx.embed('Embed content');
ctx.ephemeral('Only you see this'); // Interactions only

// Status messages
ctx.success('Operation successful!');
ctx.error('Something went wrong!');
ctx.info('Here\'s some info');
ctx.warn('Warning message');

// Files and attachments
ctx.file('./image.png');
ctx.sendFiles([file1, file2], 'With caption');

// Update/edit
ctx.update('New content'); // For interactions
ctx.defer(); // Defer the response

// Typing
ctx.typing();
```

### Component Helpers

```javascript
// Create components using fluent API
const button = ctx.newButton()
  .label('Click Me')
  .style('primary')
  .id('click_btn');

const menu = ctx.newMenu('string')
  .id('options')
  .placeholder('Select...')
  .option('One', '1')
  .option('Two', '2');

const row = ctx.newRow()
  .button(button)
  .menu(menu);
```

### Collectors & Waiters

```javascript
// Wait for message
const msg = await ctx.awaitMessage(
  m => m.author.id === ctx.user.id,
  { time: 30000 }
);

// Wait for reaction
const reaction = await ctx.awaitReaction(['👍', '👎']);

// Wait for button click
await ctx.awaitButton(message, {
  'button_id': async (interaction) => {
    await interaction.reply('Button clicked!');
  }
});

// Generic waiter
const response = await ctx.waitFor('message', filter, 30000);
```

### Pagination

```javascript
// Simple pagination
const pages = [embed1, embed2, embed3];
await ctx.paginator(pages);

// Custom pagination
await ctx.paginate(pages, {
  time: 60000,
  buttons: ['⬅️', '➡️']
});
```

### Modals & Dialogs

```javascript
// Show a modal (interactions only)
const result = await ctx.modal([
  {
    customId: 'username',
    label: 'Username',
    style: 1, // Short
    required: true
  },
  {
    customId: 'bio',
    label: 'Bio',
    style: 2, // Paragraph
    required: false
  }
], {
  title: 'User Profile',
  timeout: 60000
});

// Multi-step dialog
const answers = await ctx.dialog([
  'What is your name?',
  'What is your age?',
  'What is your favorite color?'
]);
```

### Thread Management

```javascript
// Create thread
const thread = await ctx.createThread('Discussion Topic', {
  autoArchiveDuration: 60,
  reason: 'New discussion'
});

// Pin/unpin
await ctx.pin();
await ctx.unpin();
```

### Moderation

```javascript
// Role management
await ctx.addRole(roleId, 'Reason');
await ctx.removeRole(roleId, 'Reason');
ctx.hasRole(roleId); // Check if user has role

// Timeouts & kicks
await ctx.timeout(60000, 'Timeout reason');
await ctx.kick(member, 'Kick reason');
await ctx.ban(userId, { days: 7, reason: 'Ban reason' });
await ctx.unban(userId, 'Unban reason');

// Bulk delete
await ctx.bulkDelete(100); // Delete last 100 messages
await ctx.bulkDelete(50, true); // Delete last 50 bot messages only
```

### Webhooks

```javascript
// Create webhook
const webhook = await ctx.createWebhook('My Webhook', {
  avatar: 'https://example.com/avatar.png'
});

// Send via webhook
await ctx.webhookSend(webhook, {
  content: 'Message from webhook',
  username: 'Custom Name'
});
```

### Channel Management

```javascript
// Modify channel
await ctx.modifyChannel({
  name: 'new-name',
  topic: 'New topic'
}, 'Reason');

// Clone channel
const clone = await ctx.cloneChannel();

// Delete channel
await ctx.deleteChannel('Reason');

// Set permissions
await ctx.setPermissions(role, {
  SendMessages: true,
  ViewChannel: true
}, 'Grant permissions');
```

### Server Management

```javascript
// Members
const members = await ctx.searchMembers('username', 10);
const membersWithRole = ctx.getMembersWithRole(roleId);

// Roles
const role = await ctx.createRole({
  name: 'New Role',
  color: '#FF0000',
  permissions: [...]
});
await ctx.deleteRole(roleId, 'Reason');

// Invites
const invite = await ctx.createInvite({ maxAge: 86400, maxUses: 10 });
const invites = await ctx.getInvites();

// Audit logs
const logs = await ctx.getAuditLogs({ limit: 50 });

// Bans
const bans = await ctx.getBans();
```

### Emojis & Stickers

```javascript
// Get emojis
const emojis = ctx.getEmojis();

// Create custom emoji
const emoji = await ctx.createEmoji(
  './emoji.png',
  'my_emoji',
  { roles: [roleId] }
);

// Delete emoji
await ctx.deleteEmoji(emojiId, 'Reason');

// Get stickers
const stickers = ctx.getStickers();
```

### Message Utilities

```javascript
// Get specific message
const msg = await ctx.getMessage(messageId);

// Edit message
await ctx.editMessage(messageId, 'New content');

// Delete message
await ctx.deleteMessage(messageId);

// Get referenced message (reply)
const reference = await ctx.getReference();

// Crosspost (announcement channels)
await ctx.crosspost();
```

### User Interactions

```javascript
// Direct messages
await ctx.dm(user, 'Private message');

// Fetch users/members
const user = await ctx.fetchUser(userId);
const member = await ctx.fetchMember(userId);

// Check mentions
if (ctx.mentionsBot()) {
  // Bot was mentioned
}
const mentions = ctx.getMentions(); // All mentioned users
const roles = ctx.getMentionedRoles();
const channels = ctx.getMentionedChannels();
```

### Text Formatting

```javascript
ctx.bold('Bold text'); // **Bold text**
ctx.italic('Italic text'); // *Italic text*
ctx.code('Code'); // `Code`
```

### Slash Command Options

```javascript
// Get options from slash commands
const option = ctx.getOption('option_name');
const user = ctx.getUser('user_option');
const member = ctx.getMember('user_option');
const channel = ctx.getChannel('channel_option');
const role = ctx.getRole('role_option');
```

## 🔧 Modular Managers

### CommandManager

```javascript
const { CommandManager } = require('@axrxvm/betterdiscordjs');

const cmdManager = new CommandManager(bot);

// Register command
cmdManager.register('ping', async (ctx) => {
  await ctx.reply('Pong!');
}, {
  description: 'Check latency',
  category: 'Utility',
  aliases: ['p'],
  cooldown: 5, // 5 seconds
  permissions: ['SendMessages']
});

// Add inhibitor (prevent command execution based on condition)
cmdManager.addInhibitor((ctx, command) => {
  if (command.category === 'Admin' && !ctx.member.permissions.has('Administrator')) {
    ctx.error('Admin only!');
    return false; // Inhibit
  }
  return true; // Allow
});

// Command hooks
cmdManager.beforeCommand = async (ctx, command) => {
  console.log(`${ctx.user.tag} is running ${command.name}`);
};

cmdManager.afterCommand = async (ctx, command) => {
  console.log(`${command.name} finished`);
};

// Enable/disable commands per guild
cmdManager.setEnabled(guildId, 'admin', false);

// Get commands by category
const utilityCommands = cmdManager.getByCategory('Utility');
```

### EventManager

```javascript
const { EventManager } = require('@axrxvm/betterdiscordjs');

const evtManager = new EventManager(bot);

// Register event
evtManager.register('messageCreate', async (bot, message) => {
  console.log(`Message: ${message.content}`);
}, {
  once: false,
  group: 'messages'
});

// Wildcard listener (all events)
evtManager.addWildcardListener((eventName, ...args) => {
  console.log(`Event fired: ${eventName}`);
});

// Event middleware
evtManager.beforeEvent = async (eventName, ...args) => {
  console.log(`Before: ${eventName}`);
};

// Wait for specific event
const [message] = await evtManager.waitFor(
  'messageCreate',
  msg => msg.content === 'hello',
  30000
);

// Emit custom events
evtManager.emit('customEvent', data);
```

### InteractionManager

```javascript
const { InteractionManager } = require('@axrxvm/betterdiscordjs');

const intManager = new InteractionManager(bot);

// Register slash command
intManager.registerSlashCommand({
  name: 'hello',
  description: 'Say hello',
  options: [
    {
      name: 'user',
      description: 'User to greet',
      type: 6, // USER
      required: false
    }
  ],
  execute: async (ctx, interaction) => {
    const user = ctx.getUser('user') || ctx.user;
    await ctx.reply(`Hello ${user}!`);
  }
});

// Register button handler
intManager.registerButton('my_button', async (interaction) => {
  await interaction.reply('Button clicked!');
});

// Register with regex pattern
intManager.registerButton(/^vote_\d+$/, async (interaction) => {
  const voteId = interaction.customId.split('_')[1];
  await interaction.reply(`Voted on ${voteId}`);
});

// Register select menu
intManager.registerSelectMenu('my_menu', async (interaction) => {
  const selected = interaction.values[0];
  await interaction.reply(`You selected: ${selected}`);
});

// Register modal
intManager.registerModal('my_modal', async (interaction) => {
  const value = interaction.fields.getTextInputValue('field_id');
  await interaction.reply(`You entered: ${value}`);
});

// Register autocomplete
intManager.registerAutocomplete('search', async (interaction, focused) => {
  const choices = ['option1', 'option2', 'option3']
    .filter(opt => opt.startsWith(focused.value))
    .map(opt => ({ name: opt, value: opt }));
  await interaction.respond(choices);
});

// Deploy commands to Discord
await intManager.deployCommands(
  process.env.TOKEN,
  process.env.CLIENT_ID,
  process.env.GUILD_ID // Optional, for dev mode
);

// Get stats
const stats = intManager.getStats();
console.log(`Registered ${stats.slashCommands} slash commands`);
```

## 🚀 Complete Usage Example

```javascript
const { Bot, ComponentBuilder } = require('@axrxvm/betterdiscordjs');

const bot = new Bot({
  token: process.env.TOKEN,
  prefix: '!',
  intents: ['Guilds', 'GuildMessages', 'MessageContent']
});

// Use managers
bot.commands.register('poll', async (ctx) => {
  const question = ctx.args.join(' ') || 'Vote on this!';
  
  const row = ComponentBuilder.row()
    .button(btn => btn.label('👍 Yes').style('success').id('poll_yes'))
    .button(btn => btn.label('👎 No').style('danger').id('poll_no'))
    .button(btn => btn.label('🤷 Maybe').style('secondary').id('poll_maybe'))
    .build();
  
  const msg = await ctx.reply({
    embeds: [ctx.embed().title('📊 Poll').desc(question).color('blue').build()],
    components: [row]
  });
  
  // Handle button clicks
  await ctx.awaitButton(msg, {
    'poll_yes': async (i) => await i.reply({ content: 'You voted Yes!', ephemeral: true }),
    'poll_no': async (i) => await i.reply({ content: 'You voted No!', ephemeral: true }),
    'poll_maybe': async (i) => await i.reply({ content: 'You voted Maybe!', ephemeral: true })
  }, { time: 60000 });
}, {
  description: 'Create a poll',
  category: 'Utility'
});

bot.login();
```

## 📚 Migration Guide

### Old Way (Still Supported)

```javascript
bot.command('ping', async (ctx) => {
  await ctx.reply('Pong!');
});
```

### New Way (Recommended)

```javascript
bot.commands.register('ping', async (ctx) => {
  await ctx.reply('Pong!');
}, {
  description: 'Check latency',
  category: 'Utility',
  cooldown: 3
});
```

Both methods work! The new way provides more features and better organization.

## 🎯 Key Benefits

1. **Fully Modular**: Separate managers for commands, events, and interactions
2. **100+ Context Methods**: Covers nearly all Discord.js functionality
3. **Type-Safe**: Complete TypeScript definitions
4. **Fluent API**: Chainable component builders
5. **Backwards Compatible**: Old code still works
6. **Better DX**: Improved developer experience with better error handling
7. **Production Ready**: Battle-tested architecture patterns

## 📖 Next Steps

- See [Advanced Components](advanced/components.md) for more component patterns
- Check [Advanced Examples](examples/advanced.md) for advanced usage patterns
- Review [Context API Reference](api/context.md) for complete method documentation
- Explore [Migration Guide](getting-started/migration.md) for upgrading existing bots

---

**The framework is now completely modular and ready for production use!** 🎉
