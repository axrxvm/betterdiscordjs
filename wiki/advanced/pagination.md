# Pagination

Pagination allows you to split large amounts of content across multiple pages, making it easier for users to navigate through information.

## Overview

@axrxvm/betterdiscordjs provides built-in pagination support through the Context object, making it easy to create paginated embeds with navigation controls.

## Basic Pagination

### Simple Paginator

```javascript
bot.command('help', async (ctx) => {
  const commands = Array.from(bot.commands.values());
  const pages = [];
  
  // Create pages (5 commands per page)
  for (let i = 0; i < commands.length; i += 5) {
    const pageCommands = commands.slice(i, i + 5);
    const embed = ctx.embed()
      .title('📚 Command Help')
      .desc(pageCommands.map(cmd => 
        `**${cmd.name}** - ${cmd.description || 'No description'}`
      ).join('\n'))
      .footer(`Page ${Math.floor(i / 5) + 1} of ${Math.ceil(commands.length / 5)}`)
      .color('blue');
    
    pages.push(embed.embed);
  }
  
  // Use built-in paginator
  await ctx.paginator(pages, { time: 300000 }); // 5 minutes
});
```

### Custom Paginator with More Controls

```javascript
bot.command('leaderboard', async (ctx) => {
  const users = await getLeaderboardData(); // Your data source
  const itemsPerPage = 10;
  const pages = [];
  
  // Create pages
  for (let i = 0; i < users.length; i += itemsPerPage) {
    const pageUsers = users.slice(i, i + itemsPerPage);
    const embed = ctx.embed()
      .title('🏆 Leaderboard')
      .desc(pageUsers.map((user, index) => {
        const rank = i + index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🏅';
        return `${medal} **#${rank}** ${user.name} - ${user.points} points`;
      }).join('\n'))
      .footer(`Page ${Math.floor(i / itemsPerPage) + 1} of ${Math.ceil(users.length / itemsPerPage)} • Total Users: ${users.length}`)
      .color('gold');
    
    pages.push(embed.embed);
  }
  
  let currentPage = 0;
  
  const updateComponents = () => {
    return [ctx.buttonRow([
      { customId: 'first', label: '⏮️', style: 2, disabled: currentPage === 0 },
      { customId: 'prev', label: '⬅️', style: 2, disabled: currentPage === 0 },
      { customId: 'page_info', label: `${currentPage + 1}/${pages.length}`, style: 2, disabled: true },
      { customId: 'next', label: '➡️', style: 2, disabled: currentPage === pages.length - 1 },
      { customId: 'last', label: '⏭️', style: 2, disabled: currentPage === pages.length - 1 }
    ])];
  };
  
  const msg = await ctx.reply({
    embeds: [pages[currentPage]],
    components: updateComponents()
  });
  
  await ctx.awaitButton(msg, {
    first: async (i) => {
      currentPage = 0;
      await i.update({ embeds: [pages[currentPage]], components: updateComponents() });
    },
    prev: async (i) => {
      currentPage = Math.max(0, currentPage - 1);
      await i.update({ embeds: [pages[currentPage]], components: updateComponents() });
    },
    next: async (i) => {
      currentPage = Math.min(pages.length - 1, currentPage + 1);
      await i.update({ embeds: [pages[currentPage]], components: updateComponents() });
    },
    last: async (i) => {
      currentPage = pages.length - 1;
      await i.update({ embeds: [pages[currentPage]], components: updateComponents() });
    }
  }, { time: 600000 }); // 10 minutes
});
```

## Advanced Pagination Features

### Pagination with Search

```javascript
bot.command('search', async (ctx) => {
  const query = ctx.args.join(' ');
  const allItems = await searchDatabase(query); // Your search function
  
  if (allItems.length === 0) {
    return ctx.error('❌ No results found!');
  }
  
  const itemsPerPage = 8;
  let currentPage = 0;
  let filteredItems = allItems;
  
  const createPages = (items) => {
    const pages = [];
    for (let i = 0; i < items.length; i += itemsPerPage) {
      const pageItems = items.slice(i, i + itemsPerPage);
      const embed = ctx.embed()
        .title(`🔍 Search Results: "${query}"`)
        .desc(pageItems.map((item, index) => 
          `**${i + index + 1}.** ${item.title}\n${item.description.slice(0, 100)}...`
        ).join('\n\n'))
        .footer(`Page ${Math.floor(i / itemsPerPage) + 1} of ${Math.ceil(items.length / itemsPerPage)} • ${items.length} results`)
        .color('blue');
      
      pages.push(embed.embed);
    }
    return pages;
  };
  
  let pages = createPages(filteredItems);
  
  const updateMessage = async (interaction) => {
    const components = [
      ctx.buttonRow([
        { customId: 'first', label: '⏮️', style: 2 },
        { customId: 'prev', label: '⬅️', style: 2 },
        { customId: 'next', label: '➡️', style: 2 },
        { customId: 'last', label: '⏭️', style: 2 }
      ]),
      ctx.buttonRow([
        { customId: 'filter', label: '🔽 Filter', style: 1 },
        { customId: 'sort', label: '📊 Sort', style: 1 },
        { customId: 'close', label: '❌ Close', style: 4 }
      ])
    ];
    
    await interaction.update({
      embeds: [pages[currentPage]],
      components
    });
  };
  
  const msg = await ctx.reply({
    embeds: [pages[currentPage]],
    components: [
      ctx.buttonRow([
        { customId: 'first', label: '⏮️', style: 2 },
        { customId: 'prev', label: '⬅️', style: 2 },
        { customId: 'next', label: '➡️', style: 2 },
        { customId: 'last', label: '⏭️', style: 2 }
      ]),
      ctx.buttonRow([
        { customId: 'filter', label: '🔽 Filter', style: 1 },
        { customId: 'sort', label: '📊 Sort', style: 1 },
        { customId: 'close', label: '❌ Close', style: 4 }
      ])
    ]
  });
  
  await ctx.awaitButton(msg, {
    first: async (i) => { currentPage = 0; await updateMessage(i); },
    prev: async (i) => { currentPage = Math.max(0, currentPage - 1); await updateMessage(i); },
    next: async (i) => { currentPage = Math.min(pages.length - 1, currentPage + 1); await updateMessage(i); },
    last: async (i) => { currentPage = pages.length - 1; await updateMessage(i); },
    
    filter: async (i) => {
      // Show filter options
      const filterMenu = ctx.menu([
        'All Categories',
        'Category A',
        'Category B',
        'Category C'
      ]);
      
      await i.update({
        content: 'Select a filter:',
        components: [filterMenu]
      });
    },
    
    sort: async (i) => {
      // Toggle sort order
      filteredItems.reverse();
      pages = createPages(filteredItems);
      currentPage = 0;
      await updateMessage(i);
    },
    
    close: async (i) => {
      await i.update({
        content: '🔍 Search closed.',
        embeds: [],
        components: []
      });
    }
  });
});
```

### Interactive Content Pagination

```javascript
bot.command('gallery', async (ctx) => {
  const images = await getImageGallery(); // Your image data
  let currentIndex = 0;
  
  const createEmbed = (index) => {
    const image = images[index];
    return ctx.embed()
      .title(`🖼️ Gallery - ${image.title}`)
      .desc(image.description)
      .image(image.url)
      .footer(`Image ${index + 1} of ${images.length} • Uploaded by ${image.author}`)
      .color('purple');
  };
  
  const components = [
    ctx.buttonRow([
      { customId: 'prev_img', label: '⬅️ Previous', style: 2 },
      { customId: 'random', label: '🎲 Random', style: 1 },
      { customId: 'next_img', label: 'Next ➡️', style: 2 }
    ]),
    ctx.buttonRow([
      { customId: 'favorite', label: '❤️ Favorite', style: 1 },
      { customId: 'download', label: '💾 Download', style: 1 },
      { customId: 'report', label: '🚩 Report', style: 4 }
    ])
  ];
  
  const msg = await ctx.reply({
    embeds: [createEmbed(currentIndex).embed],
    components
  });
  
  await ctx.awaitButton(msg, {
    prev_img: async (i) => {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      await i.update({ embeds: [createEmbed(currentIndex).embed], components });
    },
    
    next_img: async (i) => {
      currentIndex = (currentIndex + 1) % images.length;
      await i.update({ embeds: [createEmbed(currentIndex).embed], components });
    },
    
    random: async (i) => {
      currentIndex = Math.floor(Math.random() * images.length);
      await i.update({ embeds: [createEmbed(currentIndex).embed], components });
    },
    
    favorite: async (i) => {
      await addToFavorites(ctx.user.id, images[currentIndex].id);
      await i.reply({ content: '❤️ Added to favorites!', ephemeral: true });
    },
    
    download: async (i) => {
      const downloadLink = generateDownloadLink(images[currentIndex]);
      await i.reply({ 
        content: `💾 [Download Image](${downloadLink})`, 
        ephemeral: true 
      });
    },
    
    report: async (i) => {
      await i.reply({ 
        content: '🚩 Image reported. Thank you for keeping our gallery safe!', 
        ephemeral: true 
      });
    }
  }, { time: 900000 }); // 15 minutes
});
```

## Pagination Utilities

### Reusable Paginator Class

```javascript
class Paginator {
  constructor(ctx, options = {}) {
    this.ctx = ctx;
    this.pages = [];
    this.currentPage = 0;
    this.timeout = options.timeout || 300000; // 5 minutes
    this.showPageNumbers = options.showPageNumbers !== false;
    this.showFirstLast = options.showFirstLast !== false;
    this.itemsPerPage = options.itemsPerPage || 10;
  }
  
  addPage(embed) {
    this.pages.push(embed);
    return this;
  }
  
  addPages(embeds) {
    this.pages.push(...embeds);
    return this;
  }
  
  createFromArray(items, formatter) {
    for (let i = 0; i < items.length; i += this.itemsPerPage) {
      const pageItems = items.slice(i, i + this.itemsPerPage);
      const embed = formatter(pageItems, Math.floor(i / this.itemsPerPage) + 1, Math.ceil(items.length / this.itemsPerPage));
      this.addPage(embed);
    }
    return this;
  }
  
  getComponents() {
    const buttons = [];
    
    if (this.showFirstLast) {
      buttons.push({ customId: 'first', label: '⏮️', style: 2, disabled: this.currentPage === 0 });
    }
    
    buttons.push({ customId: 'prev', label: '⬅️', style: 2, disabled: this.currentPage === 0 });
    
    if (this.showPageNumbers) {
      buttons.push({ 
        customId: 'page_info', 
        label: `${this.currentPage + 1}/${this.pages.length}`, 
        style: 2, 
        disabled: true 
      });
    }
    
    buttons.push({ customId: 'next', label: '➡️', style: 2, disabled: this.currentPage === this.pages.length - 1 });
    
    if (this.showFirstLast) {
      buttons.push({ customId: 'last', label: '⏭️', style: 2, disabled: this.currentPage === this.pages.length - 1 });
    }
    
    return [this.ctx.buttonRow(buttons)];
  }
  
  async start() {
    if (this.pages.length === 0) {
      throw new Error('No pages to display');
    }
    
    if (this.pages.length === 1) {
      // No pagination needed for single page
      return await this.ctx.reply({ embeds: [this.pages[0]] });
    }
    
    const msg = await this.ctx.reply({
      embeds: [this.pages[this.currentPage]],
      components: this.getComponents()
    });
    
    const handlers = {
      first: async (i) => {
        this.currentPage = 0;
        await i.update({ embeds: [this.pages[this.currentPage]], components: this.getComponents() });
      },
      prev: async (i) => {
        this.currentPage = Math.max(0, this.currentPage - 1);
        await i.update({ embeds: [this.pages[this.currentPage]], components: this.getComponents() });
      },
      next: async (i) => {
        this.currentPage = Math.min(this.pages.length - 1, this.currentPage + 1);
        await i.update({ embeds: [this.pages[this.currentPage]], components: this.getComponents() });
      },
      last: async (i) => {
        this.currentPage = this.pages.length - 1;
        await i.update({ embeds: [this.pages[this.currentPage]], components: this.getComponents() });
      }
    };
    
    await this.ctx.awaitButton(msg, handlers, { time: this.timeout });
    
    return msg;
  }
}

// Usage
bot.command('userlist', async (ctx) => {
  const users = ctx.guild.members.cache.map(member => ({
    name: member.user.tag,
    joined: member.joinedAt,
    roles: member.roles.cache.size - 1 // Exclude @everyone
  }));
  
  const paginator = new Paginator(ctx, { 
    itemsPerPage: 15,
    timeout: 600000 
  });
  
  paginator.createFromArray(users, (pageUsers, pageNum, totalPages) => {
    return ctx.embed()
      .title('👥 Server Members')
      .desc(pageUsers.map((user, i) => 
        `**${user.name}**\nJoined: ${user.joined.toDateString()}\nRoles: ${user.roles}`
      ).join('\n\n'))
      .footer(`Page ${pageNum} of ${totalPages} • ${users.length} total members`)
      .color('green');
  });
  
  await paginator.start();
});
```

### Pagination with Database Integration

```javascript
bot.command('logs', async (ctx) => {
  const page = parseInt(ctx.getOption('page')) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  
  const db = require('./utils/db');
  const logs = await db.getLogs(ctx.guild.id, limit, offset);
  const totalLogs = await db.getLogCount(ctx.guild.id);
  const totalPages = Math.ceil(totalLogs / limit);
  
  if (logs.length === 0) {
    return ctx.error('❌ No logs found!');
  }
  
  const embed = ctx.embed()
    .title('📋 Server Logs')
    .desc(logs.map(log => 
      `**${log.action}** by ${log.user}\n${log.timestamp} - ${log.details}`
    ).join('\n\n'))
    .footer(`Page ${page} of ${totalPages} • ${totalLogs} total logs`)
    .color('blue');
  
  const components = [];
  
  if (totalPages > 1) {
    components.push(ctx.buttonRow([
      { customId: `logs_${Math.max(1, page - 1)}`, label: '⬅️ Previous', style: 2, disabled: page === 1 },
      { customId: 'logs_current', label: `${page}/${totalPages}`, style: 2, disabled: true },
      { customId: `logs_${Math.min(totalPages, page + 1)}`, label: 'Next ➡️', style: 2, disabled: page === totalPages }
    ]));
  }
  
  const msg = await ctx.reply({
    embeds: [embed.embed],
    components
  });
  
  // Handle page navigation
  const collector = msg.createMessageComponentCollector({ time: 300000 });
  
  collector.on('collect', async (i) => {
    const newPage = parseInt(i.customId.split('_')[1]);
    
    // Re-run the command with new page
    const newCtx = { ...ctx, raw: i };
    newCtx.getOption = (name) => name === 'page' ? newPage : ctx.getOption(name);
    
    // Update the message instead of sending new one
    const newOffset = (newPage - 1) * limit;
    const newLogs = await db.getLogs(ctx.guild.id, limit, newOffset);
    
    const newEmbed = ctx.embed()
      .title('📋 Server Logs')
      .desc(newLogs.map(log => 
        `**${log.action}** by ${log.user}\n${log.timestamp} - ${log.details}`
      ).join('\n\n'))
      .footer(`Page ${newPage} of ${totalPages} • ${totalLogs} total logs`)
      .color('blue');
    
    const newComponents = [ctx.buttonRow([
      { customId: `logs_${Math.max(1, newPage - 1)}`, label: '⬅️ Previous', style: 2, disabled: newPage === 1 },
      { customId: 'logs_current', label: `${newPage}/${totalPages}`, style: 2, disabled: true },
      { customId: `logs_${Math.min(totalPages, newPage + 1)}`, label: 'Next ➡️', style: 2, disabled: newPage === totalPages }
    ])];
    
    await i.update({
      embeds: [newEmbed.embed],
      components: newComponents
    });
  });
});
```

## Best Practices

1. **Set appropriate timeouts**
   ```javascript
   // Longer timeouts for content users might spend time reading
   await ctx.paginator(pages, { time: 600000 }); // 10 minutes
   ```

2. **Show page information**
   ```javascript
   .footer(`Page ${currentPage + 1} of ${totalPages} • ${totalItems} items`)
   ```

3. **Disable buttons when appropriate**
   ```javascript
   { customId: 'prev', label: '⬅️', style: 2, disabled: currentPage === 0 }
   ```

4. **Handle empty results**
   ```javascript
   if (items.length === 0) {
     return ctx.error('❌ No items found!');
   }
   ```

5. **Optimize for mobile users**
   - Keep page content concise
   - Use clear navigation labels
   - Consider fewer items per page

6. **Clean up expired interactions**
   ```javascript
   collector.on('end', async () => {
     await msg.edit({ 
       content: '⏳ Pagination expired.', 
       components: [] 
     });
   });
   ```

7. **Consider performance for large datasets**
   - Use database pagination instead of loading all data
   - Implement caching for frequently accessed pages
   - Limit maximum pages or items

## Common Patterns

### Quick Navigation
- First/Last buttons for long lists
- Jump to page functionality
- Search within results

### Content Types
- **Lists**: Commands, users, items
- **Galleries**: Images, media content  
- **Logs**: Historical data, events
- **Search Results**: Filtered content

### User Experience
- Clear page indicators
- Consistent navigation
- Responsive button states
- Helpful footer information## Nex
t Steps

Master data presentation techniques:

1. 🎮 [Component Interactions](./components.md) - Add interactive pagination controls
2. 🎨 [Embed Builder](./embed-builder.md) - Create beautiful paginated embeds
3. 💾 [Cache System](../utilities/cache.md) - Cache paginated data efficiently
4. 📊 [Advanced Use Cases](../examples/advanced.md) - Build complex data browsers






