# Embed Builder

@axrxvm/betterdiscordjs features a powerful and intuitive embed builder that makes creating rich Discord embeds simple and elegant. The `BetterEmbed` class provides a fluent API for building beautiful, interactive messages.

## Quick Start

### Basic Embed

```javascript
// In a command
async run(ctx) {
  const embed = ctx.embed()
    .title('Hello World!')
    .desc('This is my first embed')
    .color('blue');
  
  await embed.send();
}
```

### Simple Text Embed

```javascript
// Quick embed with just text
await ctx.embed('This is a simple embed message');
```

## Embed Builder API

### Creating Embeds

The embed builder is accessed through the context object:

```javascript
const embed = ctx.embed(); // Creates a new BetterEmbed instance
```

### Fluent API Methods

All methods return the embed instance, allowing for method chaining:

```javascript
const embed = ctx.embed()
  .title('My Title')
  .desc('My description')
  .color('green')
  .thumbnail('https://example.com/image.png');
```

## Core Methods

### Title and Description

```javascript
embed
  .title('Embed Title')           // Sets the embed title
  .desc('Embed description');     // Sets the embed description
```

### Colors

@axrxvm/betterdiscordjs provides convenient color presets:

```javascript
// Named colors
embed.color('blue');     // Discord blue (#5865F2)
embed.color('green');    // Success green (#57F287)
embed.color('red');      // Error red (#ED4245)
embed.color('yellow');   // Warning yellow (#FEE75C)
embed.color('purple');   // Purple (#9B59B6)
embed.color('orange');   // Orange (#E67E22)
embed.color('gold');     // Gold (#F1C40F)
embed.color('random');   // Random color

// Hex colors
embed.color('#FF5733');
embed.color(0xFF5733);

// RGB values
embed.color(16733267);
```

### Fields

Add structured information with fields:

```javascript
embed
  .field('Field Name', 'Field Value')           // Regular field
  .field('Inline Field 1', 'Value 1', true)    // Inline field
  .field('Inline Field 2', 'Value 2', true)    // Another inline field
  .field('Regular Field', 'This spans full width');
```

Field limitations:
- Maximum 25 fields per embed
- Field values are automatically truncated to 1024 characters
- Field names are limited to 256 characters

### Author

Set the author section of the embed:

```javascript
embed.author('Author Name', 'https://example.com/avatar.png');
```

### Footer

Customize the footer (default shows bot name):

```javascript
embed.footer('Custom footer text', 'https://example.com/icon.png');
```

### Images

Add visual content to your embeds:

```javascript
embed
  .thumbnail('https://example.com/thumbnail.png')  // Small image (top right)
  .image('https://example.com/large-image.png');   // Large image (bottom)
```

### Timestamp

Control the timestamp display:

```javascript
embed.timestamp();              // Current time (default)
embed.timestamp(new Date());    // Specific date
embed.timestamp(1640995200000); // Unix timestamp
```

## Sending Embeds

### Basic Send

```javascript
await embed.send();
```

### Send with Additional Options

```javascript
await embed.send({
  content: 'Message content above the embed',
  components: [buttonRow],
  files: ['attachment.png']
});
```

### Edit Existing Message

```javascript
const message = await ctx.reply('Loading...');
await embed.edit(message);
```

## Embed Examples

### User Information Embed

```javascript
module.exports = {
  name: 'userinfo',
  description: 'Get user information',
  
  async run(ctx) {
    const target = ctx.getUser('user') || ctx.user;
    const member = ctx.guild ? await ctx.guild.members.fetch(target.id).catch(() => null) : null;
    
    const embed = ctx.embed()
      .title(`👤 ${target.username}`)
      .thumbnail(target.displayAvatarURL({ size: 256 }))
      .field('User ID', target.id, true)
      .field('Account Created', target.createdAt.toDateString(), true)
      .color('blue');
    
    if (member) {
      embed
        .field('Joined Server', member.joinedAt.toDateString(), true)
        .field('Roles', member.roles.cache.size.toString(), true)
        .field('Nickname', member.nickname || 'None', true)
        .field('Status', member.presence?.status || 'offline', true);
    }
    
    await embed.send();
  }
};
```

### Server Statistics Embed

```javascript
async run(ctx) {
  const guild = ctx.guild;
  
  const embed = ctx.embed()
    .title(`📊 ${guild.name} Statistics`)
    .thumbnail(guild.iconURL({ size: 256 }))
    .field('👥 Members', guild.memberCount.toString(), true)
    .field('📝 Channels', guild.channels.cache.size.toString(), true)
    .field('🎭 Roles', guild.roles.cache.size.toString(), true)
    .field('😀 Emojis', guild.emojis.cache.size.toString(), true)
    .field('🚀 Boosts', guild.premiumSubscriptionCount?.toString() || '0', true)
    .field('⭐ Boost Level', guild.premiumTier.toString(), true)
    .field('👑 Owner', `<@${guild.ownerId}>`, true)
    .field('📅 Created', guild.createdAt.toDateString(), true)
    .footer(`Server ID: ${guild.id}`)
    .color('gold');
  
  await embed.send();
}
```

### Help Command with Categories

```javascript
async run(ctx) {
  const categories = {};
  
  // Group commands by category
  ctx.bot.commands.forEach(cmd => {
    const category = cmd.category || 'Uncategorized';
    if (!categories[category]) categories[category] = [];
    categories[category].push(cmd.name);
  });
  
  const embed = ctx.embed()
    .title('📚 Command Help')
    .desc(`Use \`${ctx.bot.prefix}help <command>\` for detailed help`)
    .color('blue');
  
  // Add each category as a field
  Object.entries(categories).forEach(([category, commands]) => {
    embed.field(
      `${getCategoryEmoji(category)} ${category}`,
      commands.join(', '),
      false
    );
  });
  
  embed.footer(`Total Commands: ${ctx.bot.commands.size}`);
  
  await embed.send();
}

function getCategoryEmoji(category) {
  const emojis = {
    'General': '🔧',
    'Moderation': '🛡️',
    'Fun': '🎉',
    'Utility': '⚙️',
    'Music': '🎵'
  };
  return emojis[category] || '📁';
}
```

### Error and Success Messages

```javascript
// Success embed
const embed = ctx.embed()
  .title('✅ Success!')
  .desc('Operation completed successfully')
  .color('green');

// Error embed
const embed = ctx.embed()
  .title('❌ Error!')
  .desc('Something went wrong')
  .color('red');

// Warning embed
const embed = ctx.embed()
  .title('⚠️ Warning!')
  .desc('Please be careful')
  .color('yellow');

// Info embed
const embed = ctx.embed()
  .title('ℹ️ Information')
  .desc('Here is some useful information')
  .color('blue');
```

### Progress/Loading Embed

```javascript
async run(ctx) {
  const embed = ctx.embed()
    .title('⏳ Processing...')
    .desc('Please wait while we process your request')
    .color('yellow');
  
  const message = await embed.send();
  
  // Simulate processing
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Update with success
  const successEmbed = ctx.embed()
    .title('✅ Complete!')
    .desc('Your request has been processed successfully')
    .color('green');
  
  await successEmbed.edit(message);
}
```

## Advanced Features

### Dynamic Content

```javascript
async run(ctx) {
  const user = ctx.user;
  const isOwner = user.id === ctx.guild.ownerId;
  
  const embed = ctx.embed()
    .title(`Welcome, ${user.username}!`)
    .color(isOwner ? 'gold' : 'blue');
  
  if (isOwner) {
    embed
      .desc('Welcome back, server owner! 👑')
      .thumbnail(ctx.guild.iconURL());
  } else {
    embed
      .desc('Welcome to the server!')
      .thumbnail(user.displayAvatarURL());
  }
  
  await embed.send();
}
```

### Conditional Fields

```javascript
async run(ctx) {
  const member = ctx.member;
  
  const embed = ctx.embed()
    .title('Member Information')
    .field('Username', member.user.username, true)
    .field('Joined', member.joinedAt.toDateString(), true);
  
  // Add nickname field only if user has one
  if (member.nickname) {
    embed.field('Nickname', member.nickname, true);
  }
  
  // Add roles field only if user has roles
  const roles = member.roles.cache.filter(r => r.id !== ctx.guild.id);
  if (roles.size > 0) {
    embed.field('Roles', roles.map(r => r.name).join(', '), false);
  }
  
  // Add permissions field for administrators
  if (member.permissions.has('Administrator')) {
    embed.field('⚠️ Administrator', 'This user has administrator permissions', false);
  }
  
  await embed.send();
}
```

### Embed with Pagination

```javascript
async run(ctx) {
  const members = await ctx.guild.members.fetch();
  const memberArray = Array.from(members.values());
  const pages = [];
  
  // Create pages with 10 members each
  for (let i = 0; i < memberArray.length; i += 10) {
    const pageMembers = memberArray.slice(i, i + 10);
    
    const embed = ctx.embed()
      .title(`👥 Server Members`)
      .desc(`Page ${Math.floor(i / 10) + 1} of ${Math.ceil(memberArray.length / 10)}`)
      .color('blue');
    
    pageMembers.forEach(member => {
      embed.field(
        member.user.username,
        `Joined: ${member.joinedAt.toDateString()}`,
        true
      );
    });
    
    pages.push(embed.embed);
  }
  
  await ctx.paginate(pages);
}
```

## Context Helper Methods

@axrxvm/betterdiscordjs provides convenient helper methods for common embed patterns:

### Quick Response Methods

```javascript
// Success message
await ctx.success('Operation completed successfully!');

// Error message
await ctx.error('Something went wrong!');

// Info message
await ctx.info('Here is some information.');

// Warning message
await ctx.warn('Please be careful!');
```

These methods create embeds with appropriate colors and icons automatically.

## Best Practices

### 1. Consistent Styling

```javascript
// Create a utility function for consistent embed styling
function createBaseEmbed(ctx, type = 'default') {
  const colors = {
    default: 'blue',
    success: 'green',
    error: 'red',
    warning: 'yellow'
  };
  
  return ctx.embed()
    .color(colors[type])
    .footer(`${ctx.bot.client.user.username} • ${new Date().toLocaleDateString()}`);
}

// Usage
const embed = createBaseEmbed(ctx, 'success')
  .title('Success!')
  .desc('Operation completed');
```

### 2. Field Organization

```javascript
// Group related information
const embed = ctx.embed()
  .title('User Profile')
  // Basic info
  .field('Username', user.username, true)
  .field('ID', user.id, true)
  .field('Created', user.createdAt.toDateString(), true)
  // Server info (if applicable)
  .field('Joined', member.joinedAt.toDateString(), true)
  .field('Roles', member.roles.cache.size.toString(), true)
  .field('Nickname', member.nickname || 'None', true);
```

### 3. Error Handling

```javascript
async run(ctx) {
  try {
    const data = await fetchSomeData();
    
    const embed = ctx.embed()
      .title('Data Retrieved')
      .desc(data.description)
      .color('green');
    
    await embed.send();
  } catch (error) {
    const errorEmbed = ctx.embed()
      .title('❌ Error')
      .desc('Failed to retrieve data')
      .field('Error', error.message, false)
      .color('red');
    
    await errorEmbed.send();
  }
}
```

### 4. Responsive Design

```javascript
// Adjust embed based on content length
function createAdaptiveEmbed(ctx, title, content) {
  const embed = ctx.embed().title(title);
  
  if (content.length > 2048) {
    // Use fields for long content
    const chunks = content.match(/.{1,1024}/g);
    chunks.forEach((chunk, index) => {
      embed.field(`Part ${index + 1}`, chunk, false);
    });
  } else {
    // Use description for short content
    embed.desc(content);
  }
  
  return embed;
}
```

## Embed Limits

Discord has specific limits for embeds:

- **Title**: 256 characters
- **Description**: 4096 characters
- **Fields**: Maximum 25 fields
- **Field Name**: 256 characters
- **Field Value**: 1024 characters
- **Footer Text**: 2048 characters
- **Author Name**: 256 characters
- **Total Characters**: 6000 characters across all fields

@axrxvm/betterdiscordjs automatically handles some of these limits (like field value truncation), but be mindful of the total character limit.

## Integration with Components

Embeds work seamlessly with Discord components:

```javascript
async run(ctx) {
  const embed = ctx.embed()
    .title('Choose an Option')
    .desc('Click a button below to continue')
    .color('blue');
  
  const buttons = ctx.buttonRow([
    { customId: 'option1', label: 'Option 1', style: 1 },
    { customId: 'option2', label: 'Option 2', style: 2 }
  ]);
  
  const message = await embed.send({ components: [buttons] });
  
  // Handle button interactions
  const collector = message.createMessageComponentCollector({ time: 30000 });
  collector.on('collect', async interaction => {
    const resultEmbed = ctx.embed()
      .title('Selection Made')
      .desc(`You chose: ${interaction.customId}`)
      .color('green');
    
    await interaction.update({ embeds: [resultEmbed.embed], components: [] });
  });
}
```

## Next Steps

- 🎮 Learn about [Interactive Components](./components.md)
- 📡 Explore [Event Handling](../core/events.md)
- 🔧 Master [Command Creation](../core/commands.md)
- 📦 Try the [Plugin System](../plugins/overview.md)

---

The @axrxvm/betterdiscordjs embed builder makes creating beautiful, professional Discord messages effortless while maintaining full flexibility and control.






