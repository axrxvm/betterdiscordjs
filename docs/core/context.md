# Context (Ctx) Object

The Context object (`Ctx`) is the cornerstone of @axrxvm/betterdiscordjs. It provides a unified interface for interacting with Discord, whether you're handling messages, slash commands, or other interactions.

## Overview

The `Ctx` object wraps Discord.js objects and provides additional functionality:

- **Unified API**: Same methods work for messages and interactions
- **Enhanced Utilities**: Built-in embed builder, component helpers, and more
- **Simplified Interactions**: Easy-to-use methods for common Discord operations
- **Type Safety**: Consistent behavior across different Discord event types

## Constructor

```javascript
const ctx = new Ctx(raw, bot, argsOverride);
```

**Parameters:**
- `raw`: Discord.js Message or Interaction object
- `bot`: @axrxvm/betterdiscordjs Bot instance
- `argsOverride`: Optional array to override parsed arguments

## Properties

### Core Properties

```javascript
ctx.raw             // Original Discord.js object (Message/Interaction)
ctx.bot             // @axrxvm/betterdiscordjs Bot instance
ctx.client          // Discord.js Client instance
ctx.user            // User who triggered the command
ctx.guild           // Guild where command was used (null for DMs)
ctx.channel         // Channel where command was used
ctx.member          // Guild member (null for DMs)
```

### Context Information

```javascript
ctx.isInteraction   // true if triggered by slash command
ctx.isDM            // true if used in direct message
ctx.isGuild         // true if used in a guild
ctx.args            // Array of command arguments
ctx.options         // Slash command options (interactions only)
```

## Basic Methods

### `reply(content, options)`

Send a reply to the command:

```javascript
// Simple text reply
await ctx.reply('Hello, World!');

// Reply with embed
await ctx.reply({ embeds: [embed] });

// Reply with components
await ctx.reply({
  content: 'Choose an option:',
  components: [buttonRow]
});

// Ephemeral reply (slash commands only)
await ctx.reply({
  content: 'Only you can see this!',
  ephemeral: true
});
```

### `defer()`

Defer the reply (useful for long-running commands):

```javascript
await ctx.defer(); // Shows "Bot is thinking..."

// Do some long operation
await someAsyncOperation();

// Send follow-up
await ctx.followUp('Operation completed!');
```

### `followUp(content)`

Send a follow-up message (after defer or initial reply):

```javascript
await ctx.reply('Initial response');
await ctx.followUp('Additional information');
```

## Embed Builder

### `embed(content)`

Create and send embeds easily:

```javascript
// Quick embed
await ctx.embed('This is a simple embed');

// Advanced embed builder
const embed = ctx.embed()
  .title('🎉 Welcome!')
  .desc('Welcome to our Discord server!')
  .field('Members', guild.memberCount.toString(), true)
  .field('Channels', guild.channels.cache.size.toString(), true)
  .color('green')
  .thumbnail(guild.iconURL())
  .timestamp();

await embed.send();
```

### Embed Builder Methods

```javascript
const embed = ctx.embed()
  .title('Title')                    // Set title
  .desc('Description')               // Set description
  .field('Name', 'Value', true)      // Add field (inline optional)
  .author('Author', 'icon_url')      // Set author
  .footer('Footer', 'icon_url')      // Set footer
  .thumbnail('url')                  // Set thumbnail
  .image('url')                      // Set image
  .color('blue')                     // Set color (named or hex)
  .timestamp()                       // Add timestamp
  .send();                           // Send the embed
```

### Color Options

```javascript
// Named colors
.color('blue')      // Discord blue
.color('green')     // Success green
.color('red')       // Error red
.color('yellow')    // Warning yellow
.color('purple')    // Purple
.color('orange')    // Orange
.color('gold')      // Gold
.color('random')    // Random color

// Hex colors
.color('#FF5733')
.color(0xFF5733)
```

## Quick Response Methods

### `success(message)`

Send a success message:

```javascript
await ctx.success('Operation completed successfully!');
```

### `error(message)`

Send an error message:

```javascript
await ctx.error('Something went wrong!');
```

### `info(message)`

Send an info message:

```javascript
await ctx.info('Here is some information.');
```

### `warn(message)`

Send a warning message:

```javascript
await ctx.warn('This action cannot be undone!');
```

## Slash Command Helpers

### `getOption(name)`

Get a slash command option value:

```javascript
// For slash command: /ban user:@someone reason:"spam"
const user = ctx.getOption('user');
const reason = ctx.getOption('reason') || 'No reason provided';
```

### `getUser(name)`, `getMember(name)`, `getChannel(name)`, `getRole(name)`

Get specific option types:

```javascript
const targetUser = ctx.getUser('user');
const targetMember = ctx.getMember('member');
const targetChannel = ctx.getChannel('channel');
const targetRole = ctx.getRole('role');
```

## Interactive Components

### `button(label, options, handler)`

Create a button:

```javascript
const button = ctx.button('Click Me!', {
  style: 'primary',
  customId: 'my_button'
});
```

### `buttonRow(buttons)`

Create a row of buttons:

```javascript
const row = ctx.buttonRow([
  { customId: 'yes', label: '✅ Yes', style: 3 },
  { customId: 'no', label: '❌ No', style: 4 }
]);

const msg = await ctx.reply({
  content: 'Do you agree?',
  components: [row]
});
```

### `awaitButton(message, handlers, options)`

Wait for button interactions:

```javascript
const msg = await ctx.reply({
  content: 'Choose an option:',
  components: [buttonRow]
});

await ctx.awaitButton(msg, {
  yes: async (interaction) => {
    await interaction.reply('You chose yes!');
  },
  no: async (interaction) => {
    await interaction.reply('You chose no!');
  }
}, { time: 30000 });
```

### `menu(options, handler)`

Create a select menu:

```javascript
const menu = ctx.menu(['Option 1', 'Option 2', 'Option 3']);

await ctx.reply({
  content: 'Choose an option:',
  components: [menu]
});
```

## Modals and Forms

### `modal(fields, options)`

Show a modal form:

```javascript
const result = await ctx.modal([
  {
    customId: 'name',
    label: 'Your Name',
    style: 1, // Short text
    required: true
  },
  {
    customId: 'feedback',
    label: 'Feedback',
    style: 2, // Paragraph
    required: false
  }
], {
  title: 'Feedback Form',
  timeout: 60000
});

if (result) {
  await ctx.reply(`Thank you, ${result.name}! Your feedback: ${result.feedback}`);
}
```

## Pagination

### `paginate(pages, options)`

Create paginated embeds:

```javascript
const pages = [
  ctx.embed().title('Page 1').desc('First page content'),
  ctx.embed().title('Page 2').desc('Second page content'),
  ctx.embed().title('Page 3').desc('Third page content')
];

await ctx.paginate(pages.map(p => p.embed));
```

### `paginator(pages, options)`

Advanced pagination with custom controls:

```javascript
const pages = [
  ctx.embed().title('Page 1').embed,
  ctx.embed().title('Page 2').embed,
  ctx.embed().title('Page 3').embed
];

await ctx.paginator(pages, {
  time: 60000 // 1 minute timeout
});
```

## Utility Methods

### `react(emoji)`

React to the message:

```javascript
await ctx.react('👍');
await ctx.react('<:custom:123456789>');
```

### `file(filePath)`

Send a file:

```javascript
await ctx.file('./images/welcome.png');
```

### `delete()`

Delete the command message or interaction:

```javascript
await ctx.delete();
```

### `hasPerms(permissions)`

Check user permissions:

```javascript
if (ctx.hasPerms(['Administrator'])) {
  await ctx.reply('You have admin permissions!');
} else {
  await ctx.error('You need admin permissions!');
}
```

## Text Formatting

### `bold(text)`, `italic(text)`, `code(text)`

Format text:

```javascript
const message = `
${ctx.bold('Bold text')}
${ctx.italic('Italic text')}
${ctx.code('Code text')}
`;

await ctx.reply(message);
```

## Waiting for User Input

### `awaitMessage(filter, options)`

Wait for a message from the user:

```javascript
await ctx.reply('What is your favorite color?');

const response = await ctx.awaitMessage(
  m => m.author.id === ctx.user.id,
  { time: 30000 }
);

if (response) {
  await ctx.reply(`Your favorite color is ${response.content}!`);
} else {
  await ctx.reply('You took too long to respond.');
}
```

### `awaitReaction(emojis, options)`

Wait for a reaction:

```javascript
const msg = await ctx.reply('React with 👍 or 👎');
await msg.react('👍');
await msg.react('👎');

const reaction = await ctx.awaitReaction(['👍', '👎'], { time: 30000 });

if (reaction) {
  await ctx.reply(`You reacted with ${reaction.emoji.name}!`);
}
```

### `waitFor(type, filter, timeout)`

Generic wait method:

```javascript
// Wait for message
const message = await ctx.waitFor('message', 
  m => m.author.id === ctx.user.id, 
  15000
);

// Wait for reaction
const reaction = await ctx.waitFor('reaction',
  (r, u) => u.id === ctx.user.id,
  15000
);
```

## Dialog System

### `dialog(steps, options)`

Create multi-step dialogs:

```javascript
const answers = await ctx.dialog([
  'What is your name?',
  'What is your age?',
  'What is your favorite hobby?'
], { timeout: 60000 });

if (answers.length === 3) {
  await ctx.reply(`Hello ${answers[0]}! You are ${answers[1]} years old and enjoy ${answers[2]}.`);
}
```

## User and Guild Fetching

### `fetchUser(id)`, `fetchMember(id)`

Fetch users or members:

```javascript
const user = await ctx.fetchUser('123456789');
const member = await ctx.fetchMember('123456789');
```

### `dm(user, content)`

Send a direct message:

```javascript
await ctx.dm(ctx.user, 'This is a private message!');
```

## Utility Functions

### `randomChoice(array)`

Pick a random element:

```javascript
const colors = ['red', 'blue', 'green', 'yellow'];
const randomColor = ctx.randomChoice(colors);
await ctx.reply(`Random color: ${randomColor}`);
```

## Examples

### Basic Command Handler

```javascript
// commands/general/userinfo.js
module.exports = {
  name: 'userinfo',
  description: 'Get information about a user',
  
  async run(ctx) {
    const target = ctx.args[0] ? await ctx.fetchUser(ctx.args[0]) : ctx.user;
    
    const embed = ctx.embed()
      .title(`👤 ${target.username}`)
      .thumbnail(target.displayAvatarURL())
      .field('ID', target.id, true)
      .field('Created', target.createdAt.toDateString(), true)
      .color('blue');
    
    await embed.send();
  }
};
```

### Interactive Command

```javascript
module.exports = {
  name: 'poll',
  description: 'Create a poll',
  
  async run(ctx) {
    if (!ctx.args.length) {
      return ctx.error('Please provide a question!');
    }
    
    const question = ctx.args.join(' ');
    
    const embed = ctx.embed()
      .title('📊 Poll')
      .desc(question)
      .color('blue');
    
    const row = ctx.buttonRow([
      { customId: 'yes', label: '✅ Yes', style: 3 },
      { customId: 'no', label: '❌ No', style: 4 }
    ]);
    
    const msg = await ctx.reply({
      embeds: [embed.embed],
      components: [row]
    });
    
    const votes = { yes: 0, no: 0 };
    
    await ctx.awaitButton(msg, {
      yes: async (interaction) => {
        votes.yes++;
        await interaction.reply({ 
          content: 'You voted Yes!', 
          ephemeral: true 
        });
      },
      no: async (interaction) => {
        votes.no++;
        await interaction.reply({ 
          content: 'You voted No!', 
          ephemeral: true 
        });
      }
    }, { time: 60000 });
    
    // Update with results
    const resultEmbed = ctx.embed()
      .title('📊 Poll Results')
      .desc(question)
      .field('✅ Yes', votes.yes.toString(), true)
      .field('❌ No', votes.no.toString(), true)
      .color('green');
    
    await msg.edit({
      embeds: [resultEmbed.embed],
      components: []
    });
  }
};
```

### Modal Form Example

```javascript
module.exports = {
  name: 'feedback',
  description: 'Submit feedback',
  slash: true,
  
  async run(ctx) {
    const result = await ctx.modal([
      {
        customId: 'subject',
        label: 'Subject',
        style: 1,
        required: true
      },
      {
        customId: 'message',
        label: 'Your Feedback',
        style: 2,
        required: true
      }
    ], {
      title: 'Feedback Form'
    });
    
    if (result) {
      // Send to feedback channel
      const feedbackChannel = ctx.client.channels.cache.get('FEEDBACK_CHANNEL_ID');
      if (feedbackChannel) {
        const embed = ctx.embed()
          .title(`📝 Feedback: ${result.subject}`)
          .desc(result.message)
          .author(ctx.user.tag, ctx.user.displayAvatarURL())
          .color('blue');
        
        await feedbackChannel.send({ embeds: [embed.embed] });
      }
      
      await ctx.success('Thank you for your feedback!');
    }
  }
};
```

## Best Practices

### 1. Always Handle Errors

```javascript
try {
  await ctx.reply('This might fail');
} catch (error) {
  console.error('Reply failed:', error);
  // Try alternative response method
}
```

### 2. Check Permissions

```javascript
if (!ctx.hasPerms(['ManageMessages'])) {
  return ctx.error('You need Manage Messages permission!');
}
```

### 3. Validate Input

```javascript
if (!ctx.args.length) {
  return ctx.error('Please provide some arguments!');
}

const userId = ctx.args[0];
if (!/^\d{17,19}$/.test(userId)) {
  return ctx.error('Invalid user ID format!');
}
```

### 4. Use Appropriate Response Types

```javascript
// For success operations
await ctx.success('User banned successfully!');

// For errors
await ctx.error('User not found!');

// For information
await ctx.info('This command has a 5-second cooldown.');

// For warnings
await ctx.warn('This action cannot be undone!');
```

## Next Steps

- 🎯 Learn about [Commands](./commands.md)
- 📡 Explore [Events](./events.md)
- 🎨 Master the [Embed Builder](../advanced/embed-builder.md)
- 🔧 Try [Interactive Components](../advanced/components.md)

---

The Context object makes Discord bot development intuitive and powerful, providing everything you need in a single, consistent interface.






