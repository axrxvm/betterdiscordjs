# Context API

The Context (Ctx) class provides a unified interface for interacting with Discord messages and interactions, offering a consistent API regardless of whether the command was triggered via prefix or slash command.

## Constructor

### new Ctx(raw, bot, argsOverride)

Creates a new Context instance.

**Parameters:**
- `raw` (Interaction|Message) - Raw Discord.js interaction or message
- `bot` (Bot) - Bot instance
- `argsOverride` (string[], optional) - Override parsed arguments

## Properties

### ctx.raw
- **Type:** `Interaction | Message`
- **Description:** The raw Discord.js object (interaction or message)

### ctx.bot
- **Type:** `Bot`
- **Description:** The bot instance

### ctx.client
- **Type:** `Discord.Client`
- **Description:** The Discord.js client

### ctx.isInteraction
- **Type:** `boolean`
- **Description:** Whether this context is from a slash command interaction

### ctx.user
- **Type:** `Discord.User`
- **Description:** The user who triggered the command

### ctx.guild
- **Type:** `Discord.Guild | null`
- **Description:** The guild where the command was used (null in DMs)

### ctx.channel
- **Type:** `Discord.Channel`
- **Description:** The channel where the command was used

### ctx.member
- **Type:** `Discord.GuildMember | null`
- **Description:** The guild member who triggered the command (null in DMs)

### ctx.args
- **Type:** `string[]`
- **Description:** Parsed command arguments

### ctx.options
- **Type:** `object[]`
- **Description:** Slash command options (empty for prefix commands)

### ctx.isDM
- **Type:** `boolean`
- **Description:** Whether the command was used in DMs

### ctx.isGuild
- **Type:** `boolean`
- **Description:** Whether the command was used in a guild

## Response Methods

### ctx.reply(content, options)

Send a reply to the command.

**Parameters:**
- `content` (string|object) - Message content or embed object
- `options` (object, optional) - Additional message options

**Returns:** `Promise<Message>`

**Example:**
```javascript
// Simple text reply
await ctx.reply('Hello, world!');

// Reply with embed
await ctx.reply({
  embeds: [embed],
  components: [buttonRow]
});

// Reply with options
await ctx.reply('Secret message', { ephemeral: true });
```

### ctx.success(message)

Send a success message with green embed.

**Parameters:**
- `message` (string) - Success message

**Returns:** `Promise<Message>`

### ctx.error(message)

Send an error message with red embed.

**Parameters:**
- `message` (string) - Error message

**Returns:** `Promise<Message>`

### ctx.info(message)

Send an info message with blue embed.

**Parameters:**
- `message` (string) - Info message

**Returns:** `Promise<Message>`

### ctx.warn(message)

Send a warning message with yellow embed.

**Parameters:**
- `message` (string) - Warning message

**Returns:** `Promise<Message>`

## Embed Methods

### ctx.embed(content)

Create or send an embed.

**Parameters:**
- `content` (string, optional) - Embed description

**Returns:** `BetterEmbed | Promise<Message>`

**Example:**
```javascript
// Create embed builder
const embed = ctx.embed()
  .title('My Embed')
  .desc('Description here')
  .color('blue');

await embed.send();

// Quick embed with description
await ctx.embed('Quick embed message');
```

## Option Getters (Slash Commands)

### ctx.getOption(name)

Get slash command option value.

**Parameters:**
- `name` (string) - Option name

**Returns:** `any | null`

### ctx.getUser(name)

Get user from slash command options.

**Parameters:**
- `name` (string) - Option name

**Returns:** `User | null`

### ctx.getMember(name)

Get member from slash command options.

**Parameters:**
- `name` (string) - Option name

**Returns:** `GuildMember | null`

### ctx.getChannel(name)

Get channel from slash command options.

**Parameters:**
- `name` (string) - Option name

**Returns:** `Channel | null`

### ctx.getRole(name)

Get role from slash command options.

**Parameters:**
- `name` (string) - Option name

**Returns:** `Role | null`

## Interaction Methods

### ctx.defer()

Defer the interaction reply (slash commands only).

**Returns:** `Promise<void>`

**Example:**
```javascript
await ctx.defer(); // Show "thinking..." state
// Perform long operation
await ctx.reply('Operation complete!');
```

### ctx.followUp(content)

Send a follow-up message (slash commands only).

**Parameters:**
- `content` (string|object) - Message content

**Returns:** `Promise<Message>`

### ctx.delete()

Delete the invoking message or interaction.

**Returns:** `Promise<void>`

## Utility Methods

### ctx.react(emoji)

React to the message with an emoji.

**Parameters:**
- `emoji` (string) - Emoji to react with

**Returns:** `Promise<void>`

**Example:**
```javascript
await ctx.react('👍');
await ctx.react('<:custom:123456789012345678>');
```

### ctx.file(filePath)

Send a file.

**Parameters:**
- `filePath` (string) - Path to file

**Returns:** `Promise<Message>`

### ctx.hasPerms(perms)

Check if user has permissions.

**Parameters:**
- `perms` (string[]) - Permission names

**Returns:** `boolean`

**Example:**
```javascript
if (ctx.hasPerms(['MANAGE_MESSAGES'])) {
  // User can manage messages
}
```

## Interactive Methods

### ctx.awaitMessage(filter, options)

Wait for a message from the user.

**Parameters:**
- `filter` (function) - Message filter function
- `options` (object, optional) - Await options

**Returns:** `Promise<Message | null>`

**Example:**
```javascript
await ctx.reply('What is your favorite color?');

const response = await ctx.awaitMessage(
  m => m.author.id === ctx.user.id,
  { time: 30000 }
);

if (response) {
  await ctx.reply(`Your favorite color is ${response.content}!`);
}
```

### ctx.awaitReaction(emojis, options)

Wait for a reaction from the user.

**Parameters:**
- `emojis` (string[], optional) - Allowed emojis
- `options` (object, optional) - Await options

**Returns:** `Promise<MessageReaction | null>`

### ctx.awaitComponent(type, filter, timeout)

Wait for a component interaction.

**Parameters:**
- `type` (number) - Component type
- `filter` (function) - Filter function
- `timeout` (number, optional) - Timeout in milliseconds

**Returns:** `Promise<Interaction | null>`

### ctx.awaitButton(msg, handlers, options)

Wait for button interactions with handlers.

**Parameters:**
- `msg` (Message) - Message with buttons
- `handlers` (object) - Button handlers by custom ID
- `options` (object, optional) - Options

**Returns:** `Promise<Collector>`

**Example:**
```javascript
const msg = await ctx.reply({
  content: 'Choose an option:',
  components: [buttonRow]
});

await ctx.awaitButton(msg, {
  'option1': async (interaction) => {
    await interaction.reply('You chose option 1!');
  },
  'option2': async (interaction) => {
    await interaction.reply('You chose option 2!');
  }
}, { time: 60000 });
```

## Component Creation

### ctx.button(label, options, handler)

Create a button component.

**Parameters:**
- `label` (string) - Button label
- `options` (object, optional) - Button options
- `handler` (function, optional) - Click handler

**Returns:** `ButtonBuilder`

**Example:**
```javascript
const button = ctx.button('Click Me', {
  style: 'primary',
  customId: 'my_button'
});
```

### ctx.buttonRow(buttons)

Create a row of buttons.

**Parameters:**
- `buttons` (object[]) - Button configurations

**Returns:** `ActionRowBuilder`

### ctx.menu(options, handler)

Create a select menu.

**Parameters:**
- `options` (string[]) - Menu options
- `handler` (function, optional) - Selection handler

**Returns:** `ActionRowBuilder`

## Modal Methods

### ctx.modal(fields, options)

Show a modal form (slash commands only).

**Parameters:**
- `fields` (object[]) - Modal fields
- `options` (object, optional) - Modal options

**Returns:** `Promise<object | null>`

**Example:**
```javascript
const result = await ctx.modal([
  {
    customId: 'name',
    label: 'Your Name',
    style: 1,
    required: true
  },
  {
    customId: 'message',
    label: 'Your Message',
    style: 2,
    required: true
  }
], {
  title: 'Contact Form',
  timeout: 300000
});

if (result) {
  await ctx.reply(`Hello ${result.name}! Your message: ${result.message}`);
}
```

## Pagination

### ctx.paginate(pages, options)

Create paginated embeds.

**Parameters:**
- `pages` (EmbedBuilder[]) - Array of embeds
- `options` (object, optional) - Pagination options

**Returns:** `Promise<Message>`

### ctx.paginator(pages, options)

Advanced paginator with navigation controls.

**Parameters:**
- `pages` (EmbedBuilder[]) - Array of embeds
- `options` (object, optional) - Paginator options

**Returns:** `Promise<Message>`

## Dialog Methods

### ctx.dialog(steps, options)

Create a multi-step dialog.

**Parameters:**
- `steps` (string[]) - Dialog prompts
- `options` (object, optional) - Dialog options

**Returns:** `Promise<string[]>`

**Example:**
```javascript
const answers = await ctx.dialog([
  'What is your name?',
  'What is your age?',
  'What is your favorite color?'
], { timeout: 60000 });

if (answers.length === 3) {
  await ctx.reply(`Hello ${answers[0]}, age ${answers[1]}, who likes ${answers[2]}!`);
}
```

### ctx.waitFor(type, filter, timeout)

Wait for a specific event.

**Parameters:**
- `type` (string) - Event type ('message' or 'reaction')
- `filter` (function) - Filter function
- `timeout` (number, optional) - Timeout in milliseconds

**Returns:** `Promise<Message | MessageReaction | null>`

## Text Formatting

### ctx.bold(str)

Make text bold.

**Parameters:**
- `str` (string) - Text to format

**Returns:** `string`

### ctx.italic(str)

Make text italic.

**Parameters:**
- `str` (string) - Text to format

**Returns:** `string`

### ctx.code(str)

Make text a code block.

**Parameters:**
- `str` (string) - Text to format

**Returns:** `string`

## Utility Functions

### ctx.randomChoice(arr)

Pick a random element from an array.

**Parameters:**
- `arr` (any[]) - Array to pick from

**Returns:** `any`

### ctx.dm(user, content)

Send a direct message to a user.

**Parameters:**
- `user` (User|string) - User or user ID
- `content` (string|object) - Message content

**Returns:** `Promise<Message>`

### ctx.fetchUser(id)

Fetch a user by ID.

**Parameters:**
- `id` (string) - User ID

**Returns:** `Promise<User>`

### ctx.fetchMember(id)

Fetch a member by ID from current guild.

**Parameters:**
- `id` (string) - Member ID

**Returns:** `Promise<GuildMember>`

## BetterEmbed Class

The BetterEmbed class provides a fluent API for creating Discord embeds.

### Methods

#### embed.title(text)
Set embed title.

#### embed.desc(text)
Set embed description.

#### embed.color(color)
Set embed color (string name or hex).

#### embed.field(name, value, inline)
Add a field to the embed.

#### embed.author(name, icon)
Set embed author.

#### embed.footer(text, icon)
Set embed footer.

#### embed.thumbnail(url)
Set embed thumbnail.

#### embed.image(url)
Set embed image.

#### embed.timestamp(time)
Set embed timestamp.

#### embed.send(options)
Send the embed.

#### embed.edit(msg, options)
Edit a message with the embed.

**Example:**
```javascript
const embed = ctx.embed()
  .title('User Profile')
  .desc('User information')
  .field('Name', user.tag, true)
  .field('ID', user.id, true)
  .field('Created', user.createdAt.toDateString(), true)
  .thumbnail(user.displayAvatarURL())
  .color('blue')
  .timestamp()
  .footer('Requested by ' + ctx.user.tag);

await embed.send();
```

## Best Practices

1. **Always check if context is from interaction when using interaction-specific methods**
2. **Use appropriate response methods (success, error, info, warn)**
3. **Handle timeouts gracefully in interactive methods**
4. **Validate user input before processing**
5. **Use ephemeral responses for user-specific information**
6. **Clean up components after use**
7. **Provide clear error messages to users**##
 Next Steps

Now that you understand the Context API:

1. 🎯 [Commands](../core/commands.md) - Build powerful command handlers
2. 🔧 [Bot Class API](./bot.md) - Explore the main Bot class methods
3. 🎨 [Embed Builder](../advanced/embed-builder.md) - Create beautiful message embeds
4. 🔌 [Plugin API](./plugin.md) - Develop reusable bot modules






