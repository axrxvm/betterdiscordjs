# Component Interactions

Component interactions allow you to create interactive Discord messages with buttons, select menus, and other UI elements that users can interact with.

## Overview

@axrxvm/betterdiscordjs provides built-in support for Discord's message components through the Context (Ctx) object, making it easy to create interactive experiences.

## Button Components

### Creating Buttons

```javascript
// Simple button
const button = ctx.button('Click Me', { style: 'primary' });

// Button with custom ID
const button = ctx.button('Delete', { 
  customId: 'delete_msg',
  style: 'danger' 
});

// Button with handler
const button = ctx.button('Confirm', { style: 'success' }, async (interaction) => {
  await interaction.reply('Confirmed!');
});
```

### Button Styles

- `primary` (blue)
- `secondary` (gray) 
- `success` (green)
- `danger` (red)
- `link` (for URLs)

### Button Examples

```javascript
bot.command('poll', async (ctx) => {
  const question = ctx.args.join(' ');
  
  const yesButton = ctx.button('👍 Yes', { 
    customId: 'poll_yes',
    style: 'success' 
  });
  
  const noButton = ctx.button('👎 No', { 
    customId: 'poll_no',
    style: 'danger' 
  });
  
  const row = ctx.buttonRow([
    { customId: 'poll_yes', label: '👍 Yes', style: 1 },
    { customId: 'poll_no', label: '👎 No', style: 4 }
  ]);
  
  const embed = ctx.embed()
    .title('📊 Poll')
    .desc(question)
    .color('blue');
  
  const msg = await ctx.reply({ 
    embeds: [embed.embed], 
    components: [row] 
  });
  
  // Handle button interactions
  await ctx.awaitButton(msg, {
    poll_yes: async (interaction) => {
      await interaction.reply({ content: 'You voted Yes!', ephemeral: true });
    },
    poll_no: async (interaction) => {
      await interaction.reply({ content: 'You voted No!', ephemeral: true });
    }
  }, { time: 300000 }); // 5 minutes
});
```

### Confirmation Dialogs

```javascript
bot.command('delete', async (ctx) => {
  const confirmButton = ctx.button('✅ Confirm', { 
    customId: 'confirm_delete',
    style: 'danger' 
  });
  
  const cancelButton = ctx.button('❌ Cancel', { 
    customId: 'cancel_delete',
    style: 'secondary' 
  });
  
  const row = ctx.buttonRow([
    { customId: 'confirm_delete', label: '✅ Confirm', style: 4 },
    { customId: 'cancel_delete', label: '❌ Cancel', style: 2 }
  ]);
  
  const msg = await ctx.reply({
    content: '⚠️ Are you sure you want to delete this?',
    components: [row]
  });
  
  await ctx.awaitButton(msg, {
    confirm_delete: async (interaction) => {
      await interaction.update({ 
        content: '✅ Deleted successfully!', 
        components: [] 
      });
      // Perform deletion logic here
    },
    cancel_delete: async (interaction) => {
      await interaction.update({ 
        content: '❌ Cancelled.', 
        components: [] 
      });
    }
  });
});
```

## Select Menu Components

### Creating Select Menus

```javascript
const options = ['Option 1', 'Option 2', 'Option 3'];
const menu = ctx.menu(options, async (interaction) => {
  const selected = interaction.values[0];
  await interaction.reply(`You selected: ${selected}`);
});
```

### Advanced Select Menu

```javascript
bot.command('role', async (ctx) => {
  const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
  
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('role_select')
    .setPlaceholder('Choose your role')
    .addOptions([
      {
        label: 'Developer',
        description: 'For developers and programmers',
        value: 'developer',
        emoji: '💻'
      },
      {
        label: 'Designer',
        description: 'For UI/UX designers',
        value: 'designer',
        emoji: '🎨'
      },
      {
        label: 'Manager',
        description: 'For project managers',
        value: 'manager',
        emoji: '📋'
      }
    ]);
  
  const row = new ActionRowBuilder().addComponents(selectMenu);
  
  const msg = await ctx.reply({
    content: 'Select your role:',
    components: [row]
  });
  
  const collector = msg.createMessageComponentCollector({
    componentType: 3, // SELECT_MENU
    time: 60000
  });
  
  collector.on('collect', async (interaction) => {
    const roleValue = interaction.values[0];
    const roleMap = {
      developer: 'DEVELOPER_ROLE_ID',
      designer: 'DESIGNER_ROLE_ID',
      manager: 'MANAGER_ROLE_ID'
    };
    
    const roleId = roleMap[roleValue];
    const role = ctx.guild.roles.cache.get(roleId);
    
    if (role) {
      await interaction.member.roles.add(role);
      await interaction.reply({ 
        content: `✅ Added ${role.name} role!`, 
        ephemeral: true 
      });
    }
  });
});
```

## Multi-Step Interactions

### Wizard-Style Interface

```javascript
bot.command('setup', async (ctx) => {
  let step = 1;
  let config = {};
  
  const nextButton = ctx.button('Next ➡️', { 
    customId: 'next',
    style: 'primary' 
  });
  
  const prevButton = ctx.button('⬅️ Previous', { 
    customId: 'prev',
    style: 'secondary' 
  });
  
  const finishButton = ctx.button('✅ Finish', { 
    customId: 'finish',
    style: 'success' 
  });
  
  const updateMessage = async (interaction) => {
    let content, components;
    
    switch (step) {
      case 1:
        content = 'Step 1: Choose your prefix';
        components = [ctx.buttonRow([
          { customId: 'prefix_!', label: '!', style: 2 },
          { customId: 'prefix_?', label: '?', style: 2 },
          { customId: 'prefix_/', label: '/', style: 2 },
          { customId: 'next', label: 'Next ➡️', style: 1 }
        ])];
        break;
        
      case 2:
        content = `Step 2: Choose welcome channel\nPrefix: ${config.prefix}`;
        // Add channel selection logic
        components = [ctx.buttonRow([
          { customId: 'prev', label: '⬅️ Previous', style: 2 },
          { customId: 'next', label: 'Next ➡️', style: 1 }
        ])];
        break;
        
      case 3:
        content = `Step 3: Review settings\nPrefix: ${config.prefix}\nWelcome Channel: ${config.channel}`;
        components = [ctx.buttonRow([
          { customId: 'prev', label: '⬅️ Previous', style: 2 },
          { customId: 'finish', label: '✅ Finish', style: 3 }
        ])];
        break;
    }
    
    await interaction.update({ content, components });
  };
  
  const msg = await ctx.reply({
    content: 'Step 1: Choose your prefix',
    components: [ctx.buttonRow([
      { customId: 'prefix_!', label: '!', style: 2 },
      { customId: 'prefix_?', label: '?', style: 2 },
      { customId: 'prefix_/', label: '/', style: 2 }
    ])]
  });
  
  await ctx.awaitButton(msg, {
    'prefix_!': async (i) => { config.prefix = '!'; step = 2; await updateMessage(i); },
    'prefix_?': async (i) => { config.prefix = '?'; step = 2; await updateMessage(i); },
    'prefix_/': async (i) => { config.prefix = '/'; step = 2; await updateMessage(i); },
    next: async (i) => { step++; await updateMessage(i); },
    prev: async (i) => { step--; await updateMessage(i); },
    finish: async (i) => {
      await i.update({ 
        content: '✅ Setup completed!', 
        components: [] 
      });
      // Save configuration
    }
  }, { time: 300000 });
});
```

## Pagination with Components

### Advanced Paginator

```javascript
bot.command('help', async (ctx) => {
  const commands = Array.from(bot.commands.values());
  const itemsPerPage = 5;
  const pages = [];
  
  // Create pages
  for (let i = 0; i < commands.length; i += itemsPerPage) {
    const pageCommands = commands.slice(i, i + itemsPerPage);
    const embed = ctx.embed()
      .title('📚 Command Help')
      .desc(pageCommands.map(cmd => 
        `**${cmd.name}** - ${cmd.description}`
      ).join('\n'))
      .footer(`Page ${Math.floor(i / itemsPerPage) + 1}/${Math.ceil(commands.length / itemsPerPage)}`)
      .color('blue');
    
    pages.push(embed.embed);
  }
  
  let currentPage = 0;
  
  const components = [ctx.buttonRow([
    { customId: 'first', label: '⏮️', style: 2 },
    { customId: 'prev', label: '⬅️', style: 2 },
    { customId: 'next', label: '➡️', style: 2 },
    { customId: 'last', label: '⏭️', style: 2 },
    { customId: 'stop', label: '⏹️', style: 4 }
  ])];
  
  const msg = await ctx.reply({
    embeds: [pages[currentPage]],
    components
  });
  
  await ctx.awaitButton(msg, {
    first: async (i) => {
      currentPage = 0;
      await i.update({ embeds: [pages[currentPage]], components });
    },
    prev: async (i) => {
      currentPage = Math.max(0, currentPage - 1);
      await i.update({ embeds: [pages[currentPage]], components });
    },
    next: async (i) => {
      currentPage = Math.min(pages.length - 1, currentPage + 1);
      await i.update({ embeds: [pages[currentPage]], components });
    },
    last: async (i) => {
      currentPage = pages.length - 1;
      await i.update({ embeds: [pages[currentPage]], components });
    },
    stop: async (i) => {
      await i.update({ embeds: [pages[currentPage]], components: [] });
    }
  }, { time: 300000 });
});
```

## Dynamic Components

### Context-Aware Buttons

```javascript
bot.command('music', async (ctx) => {
  const isPlaying = getMusicStatus(); // Your music logic
  
  const playButton = ctx.button(
    isPlaying ? '⏸️ Pause' : '▶️ Play', 
    { 
      customId: 'toggle_play',
      style: isPlaying ? 'secondary' : 'success'
    }
  );
  
  const components = [ctx.buttonRow([
    { customId: 'toggle_play', label: isPlaying ? '⏸️ Pause' : '▶️ Play', style: isPlaying ? 2 : 3 },
    { customId: 'skip', label: '⏭️ Skip', style: 2 },
    { customId: 'stop', label: '⏹️ Stop', style: 4 }
  ])];
  
  const embed = ctx.embed()
    .title('🎵 Music Player')
    .desc(isPlaying ? 'Currently playing...' : 'Music paused')
    .color(isPlaying ? 'green' : 'yellow');
  
  const msg = await ctx.reply({
    embeds: [embed.embed],
    components
  });
  
  await ctx.awaitButton(msg, {
    toggle_play: async (i) => {
      // Toggle music and update message
      const newStatus = toggleMusic();
      const newEmbed = ctx.embed()
        .title('🎵 Music Player')
        .desc(newStatus ? 'Currently playing...' : 'Music paused')
        .color(newStatus ? 'green' : 'yellow');
      
      const newComponents = [ctx.buttonRow([
        { customId: 'toggle_play', label: newStatus ? '⏸️ Pause' : '▶️ Play', style: newStatus ? 2 : 3 },
        { customId: 'skip', label: '⏭️ Skip', style: 2 },
        { customId: 'stop', label: '⏹️ Stop', style: 4 }
      ])];
      
      await i.update({ embeds: [newEmbed.embed], components: newComponents });
    },
    skip: async (i) => {
      skipTrack();
      await i.reply({ content: '⏭️ Skipped track!', ephemeral: true });
    },
    stop: async (i) => {
      stopMusic();
      await i.update({ 
        content: '⏹️ Music stopped.', 
        embeds: [], 
        components: [] 
      });
    }
  });
});
```

## Best Practices

1. **Always handle timeouts**
   ```javascript
   await ctx.awaitButton(msg, handlers, { time: 60000 });
   ```

2. **Provide visual feedback**
   ```javascript
   await interaction.deferUpdate(); // Show loading state
   // Perform action
   await interaction.editReply({ content: 'Done!' });
   ```

3. **Clean up components when done**
   ```javascript
   await interaction.update({ 
     content: 'Completed!', 
     components: [] // Remove buttons
   });
   ```

4. **Use ephemeral responses for user-specific actions**
   ```javascript
   await interaction.reply({ 
     content: 'Action completed!', 
     ephemeral: true 
   });
   ```

5. **Validate user permissions**
   ```javascript
   if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
     return interaction.reply({ 
       content: '❌ No permission!', 
       ephemeral: true 
     });
   }
   ```

6. **Handle component expiration gracefully**
   ```javascript
   collector.on('end', async () => {
     await msg.edit({ 
       content: '⏳ This interaction has expired.', 
       components: [] 
     });
   });
   ```

## Error Handling

```javascript
bot.command('interactive', async (ctx) => {
  try {
    const msg = await ctx.reply({
      content: 'Click a button!',
      components: [/* buttons */]
    });
    
    await ctx.awaitButton(msg, {
      action: async (interaction) => {
        try {
          await performAction();
          await interaction.reply('Success!');
        } catch (error) {
          console.error('Action failed:', error);
          await interaction.reply({ 
            content: '❌ Action failed!', 
            ephemeral: true 
          });
        }
      }
    });
  } catch (error) {
    console.error('Component interaction failed:', error);
    await ctx.error('Failed to create interactive message.');
  }
});
```
## Next Steps

Create more interactive experiences:

1. 🎨 [Embed Builder](./embed-builder.md) - Combine components with rich embeds
2. 📝 [Modals & Forms](./modals.md) - Collect detailed user input
3. 📄 [Pagination](./pagination.md) - Handle large datasets interactively
4. 🔧 [Middleware & Hooks](./middleware.md) - Add component interaction processing






