# Plugin Examples

This section provides comprehensive examples of creating plugins for @axrxvm/betterdiscordjs, from simple utility plugins to complex feature-rich systems.

## Basic Plugin Structure

### Simple Utility Plugin

```javascript
const { BasePlugin } = require('@axrxvm/betterdiscordjs');

class UtilityPlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    this.name = 'utility';
    this.version = '1.0.0';
    this.description = 'Basic utility commands';
    this.author = 'Your Name';
  }

  async onLoad() {
    this.logger.info('Loading utility plugin...');
    
    // Register commands
    this.registerCommand('uptime', this.uptimeCommand.bind(this), {
      description: 'Show bot uptime'
    });
    
    this.registerCommand('ping', this.pingCommand.bind(this), {
      description: 'Check bot latency',
      cooldown: '3s'
    });
    
    this.registerCommand('stats', this.statsCommand.bind(this), {
      description: 'Show bot statistics'
    });
  }

  async onUnload() {
    this.logger.info('Unloading utility plugin...');
    // Cleanup if needed
  }

  async uptimeCommand(ctx) {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    const embed = ctx.embed()
      .title('⏰ Bot Uptime')
      .desc(`${days}d ${hours}h ${minutes}m ${seconds}s`)
      .color('blue');
    
    await embed.send();
  }

  async pingCommand(ctx) {
    const start = Date.now();
    const msg = await ctx.reply('🏓 Pinging...');
    const latency = Date.now() - start;
    
    const embed = ctx.embed()
      .title('🏓 Pong!')
      .field('Message Latency', `${latency}ms`, true)
      .field('API Latency', `${this.bot.client.ws.ping}ms`, true)
      .color('green');
    
    await msg.edit({ embeds: [embed.embed] });
  }

  async statsCommand(ctx) {
    const embed = ctx.embed()
      .title('📊 Bot Statistics')
      .field('Servers', this.bot.client.guilds.cache.size.toString(), true)
      .field('Users', this.bot.client.users.cache.size.toString(), true)
      .field('Commands', this.bot.commands.size.toString(), true)
      .field('Memory Usage', `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, true)
      .color('blue');
    
    await embed.send();
  }
}

module.exports = UtilityPlugin;
```

## Economy Plugin

### Complete Economy System

```javascript
const { BasePlugin } = require('@axrxvm/betterdiscordjs');

class EconomyPlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    this.name = 'economy';
    this.version = '2.0.0';
    this.description = 'Complete economy system with currency, shop, and gambling';
    this.author = 'Your Name';
    
    // Plugin configuration
    this.defaultConfig = {
      currency: {
        name: 'coins',
        symbol: '🪙',
        dailyAmount: 100,
        workMin: 50,
        workMax: 200
      },
      shop: {
        items: [
          { id: 'coffee', name: 'Coffee', price: 50, emoji: '☕' },
          { id: 'pizza', name: 'Pizza', price: 150, emoji: '🍕' },
          { id: 'car', name: 'Car', price: 10000, emoji: '🚗' }
        ]
      }
    };
  }

  async onLoad() {
    this.logger.info('Loading economy plugin...');
    
    // Initialize configuration
    const config = this.config.get('settings', this.defaultConfig);
    this.config.set('settings', config);
    await this.config.save();
    
    // Register commands
    this.registerCommand('balance', this.balanceCommand.bind(this), {
      description: 'Check your balance',
      aliases: ['bal', 'money']
    });
    
    this.registerCommand('daily', this.dailyCommand.bind(this), {
      description: 'Claim your daily reward',
      cooldown: '24h'
    });
    
    this.registerCommand('work', this.workCommand.bind(this), {
      description: 'Work to earn money',
      cooldown: '1h'
    });
    
    this.registerCommand('pay', this.payCommand.bind(this), {
      description: 'Pay another user',
      options: [
        { name: 'user', description: 'User to pay', type: 6, required: true },
        { name: 'amount', description: 'Amount to pay', type: 4, required: true }
      ],
      slash: true
    });
    
    this.registerCommand('shop', this.shopCommand.bind(this), {
      description: 'View the shop'
    });
    
    this.registerCommand('buy', this.buyCommand.bind(this), {
      description: 'Buy an item from the shop',
      options: [
        { name: 'item', description: 'Item to buy', type: 3, required: true }
      ],
      slash: true
    });
    
    this.registerCommand('inventory', this.inventoryCommand.bind(this), {
      description: 'View your inventory',
      aliases: ['inv']
    });
    
    this.registerCommand('gamble', this.gambleCommand.bind(this), {
      description: 'Gamble your coins',
      options: [
        { name: 'amount', description: 'Amount to gamble', type: 4, required: true }
      ],
      slash: true,
      cooldown: '30s'
    });
  }

  async getUserData(userId) {
    const userData = await this.bot.db?.getUserConfig(userId, 'economy', {
      balance: 0,
      inventory: [],
      lastDaily: 0,
      lastWork: 0
    });
    return userData;
  }

  async setUserData(userId, data) {
    await this.bot.db?.setUserConfig(userId, 'economy', data);
  }

  async balanceCommand(ctx) {
    const target = ctx.getUser('user') || ctx.user;
    const userData = await this.getUserData(target.id);
    const config = this.config.get('settings');
    
    const embed = ctx.embed()
      .title(`${config.currency.symbol} Balance`)
      .desc(`${target.tag} has **${userData.balance}** ${config.currency.name}`)
      .color('gold');
    
    await embed.send();
  }

  async dailyCommand(ctx) {
    const userData = await this.getUserData(ctx.user.id);
    const config = this.config.get('settings');
    const now = Date.now();
    
    // Check if user already claimed today
    if (now - userData.lastDaily < 24 * 60 * 60 * 1000) {
      const timeLeft = 24 * 60 * 60 * 1000 - (now - userData.lastDaily);
      const hours = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
      
      return ctx.error(`❌ You already claimed your daily reward! Come back in ${hours}h ${minutes}m`);
    }
    
    userData.balance += config.currency.dailyAmount;
    userData.lastDaily = now;
    
    await this.setUserData(ctx.user.id, userData);
    
    const embed = ctx.embed()
      .title('🎁 Daily Reward')
      .desc(`You received **${config.currency.dailyAmount}** ${config.currency.name}!`)
      .field('New Balance', `${userData.balance} ${config.currency.name}`)
      .color('green');
    
    await embed.send();
  }

  async workCommand(ctx) {
    const userData = await this.getUserData(ctx.user.id);
    const config = this.config.get('settings');
    const now = Date.now();
    
    // Check cooldown
    if (now - userData.lastWork < 60 * 60 * 1000) {
      const timeLeft = 60 * 60 * 1000 - (now - userData.lastWork);
      const minutes = Math.floor(timeLeft / (60 * 1000));
      
      return ctx.error(`❌ You're tired! Rest for ${minutes} more minutes.`);
    }
    
    const jobs = [
      'delivered pizzas', 'walked dogs', 'washed cars', 'mowed lawns',
      'tutored students', 'cleaned houses', 'painted fences', 'fixed computers'
    ];
    
    const job = ctx.randomChoice(jobs);
    const earned = Math.floor(Math.random() * (config.currency.workMax - config.currency.workMin + 1)) + config.currency.workMin;
    
    userData.balance += earned;
    userData.lastWork = now;
    
    await this.setUserData(ctx.user.id, userData);
    
    const embed = ctx.embed()
      .title('💼 Work Complete')
      .desc(`You ${job} and earned **${earned}** ${config.currency.name}!`)
      .field('New Balance', `${userData.balance} ${config.currency.name}`)
      .color('blue');
    
    await embed.send();
  }

  async payCommand(ctx) {
    const target = ctx.getUser('user');
    const amount = ctx.getOption('amount');
    
    if (!target || target.bot) {
      return ctx.error('❌ Please specify a valid user!');
    }
    
    if (target.id === ctx.user.id) {
      return ctx.error('❌ You cannot pay yourself!');
    }
    
    if (amount <= 0) {
      return ctx.error('❌ Amount must be positive!');
    }
    
    const senderData = await this.getUserData(ctx.user.id);
    const receiverData = await this.getUserData(target.id);
    const config = this.config.get('settings');
    
    if (senderData.balance < amount) {
      return ctx.error(`❌ You don't have enough ${config.currency.name}!`);
    }
    
    senderData.balance -= amount;
    receiverData.balance += amount;
    
    await this.setUserData(ctx.user.id, senderData);
    await this.setUserData(target.id, receiverData);
    
    const embed = ctx.embed()
      .title('💸 Payment Sent')
      .desc(`${ctx.user} paid **${amount}** ${config.currency.name} to ${target}`)
      .field('Your Balance', `${senderData.balance} ${config.currency.name}`)
      .color('green');
    
    await embed.send();
    
    // Notify recipient
    try {
      await target.send(`💰 You received **${amount}** ${config.currency.name} from ${ctx.user.tag}!`);
    } catch (error) {
      // User has DMs disabled
    }
  }

  async shopCommand(ctx) {
    const config = this.config.get('settings');
    const items = config.shop.items;
    
    const embed = ctx.embed()
      .title('🛒 Shop')
      .desc('Use `/buy <item>` to purchase items')
      .color('blue');
    
    items.forEach(item => {
      embed.field(
        `${item.emoji} ${item.name}`,
        `${item.price} ${config.currency.name}`,
        true
      );
    });
    
    await embed.send();
  }

  async buyCommand(ctx) {
    const itemId = ctx.getOption('item')?.toLowerCase();
    const config = this.config.get('settings');
    const item = config.shop.items.find(i => i.id === itemId || i.name.toLowerCase() === itemId);
    
    if (!item) {
      return ctx.error('❌ Item not found! Check the shop for available items.');
    }
    
    const userData = await this.getUserData(ctx.user.id);
    
    if (userData.balance < item.price) {
      return ctx.error(`❌ You need **${item.price}** ${config.currency.name} to buy this item!`);
    }
    
    userData.balance -= item.price;
    userData.inventory.push({
      id: item.id,
      name: item.name,
      emoji: item.emoji,
      purchasedAt: Date.now()
    });
    
    await this.setUserData(ctx.user.id, userData);
    
    const embed = ctx.embed()
      .title('✅ Purchase Complete')
      .desc(`You bought ${item.emoji} **${item.name}** for **${item.price}** ${config.currency.name}!`)
      .field('New Balance', `${userData.balance} ${config.currency.name}`)
      .color('green');
    
    await embed.send();
  }

  async inventoryCommand(ctx) {
    const userData = await this.getUserData(ctx.user.id);
    
    if (userData.inventory.length === 0) {
      return ctx.error('❌ Your inventory is empty! Visit the shop to buy items.');
    }
    
    const itemCounts = {};
    userData.inventory.forEach(item => {
      const key = `${item.emoji} ${item.name}`;
      itemCounts[key] = (itemCounts[key] || 0) + 1;
    });
    
    const embed = ctx.embed()
      .title('🎒 Your Inventory')
      .desc(Object.entries(itemCounts).map(([item, count]) => 
        `${item} x${count}`
      ).join('\n'))
      .color('purple');
    
    await embed.send();
  }

  async gambleCommand(ctx) {
    const amount = ctx.getOption('amount');
    const userData = await this.getUserData(ctx.user.id);
    const config = this.config.get('settings');
    
    if (amount <= 0) {
      return ctx.error('❌ Amount must be positive!');
    }
    
    if (userData.balance < amount) {
      return ctx.error(`❌ You don't have enough ${config.currency.name}!`);
    }
    
    const winChance = 0.45; // 45% chance to win
    const won = Math.random() < winChance;
    
    if (won) {
      const multiplier = 1.5 + Math.random() * 0.5; // 1.5x to 2x multiplier
      const winnings = Math.floor(amount * multiplier);
      userData.balance += winnings - amount; // Net gain
      
      await this.setUserData(ctx.user.id, userData);
      
      const embed = ctx.embed()
        .title('🎰 You Won!')
        .desc(`You won **${winnings}** ${config.currency.name}!`)
        .field('Net Gain', `+${winnings - amount} ${config.currency.name}`)
        .field('New Balance', `${userData.balance} ${config.currency.name}`)
        .color('green');
      
      await embed.send();
    } else {
      userData.balance -= amount;
      
      await this.setUserData(ctx.user.id, userData);
      
      const embed = ctx.embed()
        .title('💸 You Lost!')
        .desc(`You lost **${amount}** ${config.currency.name}!`)
        .field('New Balance', `${userData.balance} ${config.currency.name}`)
        .color('red');
      
      await embed.send();
    }
  }
}

module.exports = EconomyPlugin;
```

## Moderation Plugin

### Advanced Moderation System

```javascript
const { BasePlugin } = require('@axrxvm/betterdiscordjs');

class ModerationPlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    this.name = 'moderation';
    this.version = '1.5.0';
    this.description = 'Advanced moderation tools';
    this.author = 'Your Name';
    
    this.infractions = new Map(); // Temporary storage
  }

  async onLoad() {
    this.logger.info('Loading moderation plugin...');
    
    // Register commands
    this.registerCommand('warn', this.warnCommand.bind(this), {
      description: 'Warn a user',
      options: [
        { name: 'user', description: 'User to warn', type: 6, required: true },
        { name: 'reason', description: 'Reason for warning', type: 3, required: false }
      ],
      slash: true,
      guildOnly: true,
      permissions: ['MANAGE_MESSAGES']
    });
    
    this.registerCommand('warnings', this.warningsCommand.bind(this), {
      description: 'View user warnings',
      options: [
        { name: 'user', description: 'User to check', type: 6, required: false }
      ],
      slash: true,
      guildOnly: true,
      permissions: ['MANAGE_MESSAGES']
    });
    
    this.registerCommand('mute', this.muteCommand.bind(this), {
      description: 'Mute a user',
      options: [
        { name: 'user', description: 'User to mute', type: 6, required: true },
        { name: 'duration', description: 'Mute duration', type: 3, required: false },
        { name: 'reason', description: 'Reason for mute', type: 3, required: false }
      ],
      slash: true,
      guildOnly: true,
      permissions: ['MODERATE_MEMBERS']
    });
    
    this.registerCommand('unmute', this.unmuteCommand.bind(this), {
      description: 'Unmute a user',
      options: [
        { name: 'user', description: 'User to unmute', type: 6, required: true },
        { name: 'reason', description: 'Reason for unmute', type: 3, required: false }
      ],
      slash: true,
      guildOnly: true,
      permissions: ['MODERATE_MEMBERS']
    });
    
    this.registerCommand('ban', this.banCommand.bind(this), {
      description: 'Ban a user',
      options: [
        { name: 'user', description: 'User to ban', type: 6, required: true },
        { name: 'reason', description: 'Reason for ban', type: 3, required: false },
        { name: 'delete_days', description: 'Days of messages to delete', type: 4, required: false }
      ],
      slash: true,
      guildOnly: true,
      permissions: ['BAN_MEMBERS']
    });
    
    this.registerCommand('unban', this.unbanCommand.bind(this), {
      description: 'Unban a user',
      options: [
        { name: 'user_id', description: 'User ID to unban', type: 3, required: true },
        { name: 'reason', description: 'Reason for unban', type: 3, required: false }
      ],
      slash: true,
      guildOnly: true,
      permissions: ['BAN_MEMBERS']
    });
    
    this.registerCommand('modlogs', this.modlogsCommand.bind(this), {
      description: 'View moderation logs',
      options: [
        { name: 'user', description: 'User to check logs for', type: 6, required: false }
      ],
      slash: true,
      guildOnly: true,
      permissions: ['MANAGE_MESSAGES']
    });
    
    // Register events
    this.registerEvent('messageCreate', this.onMessage.bind(this));
  }

  async logAction(guildId, action, moderator, target, reason, duration = null) {
    const logEntry = {
      id: Date.now().toString(),
      action,
      moderator: moderator.id,
      moderatorTag: moderator.tag,
      target: target.id,
      targetTag: target.tag,
      reason: reason || 'No reason provided',
      duration,
      timestamp: new Date().toISOString()
    };
    
    // Store in database (simplified)
    const logs = await this.bot.db?.getGuildConfig(guildId, 'modLogs', []);
    logs.push(logEntry);
    await this.bot.db?.setGuildConfig(guildId, 'modLogs', logs);
    
    // Send to mod log channel
    const guild = this.bot.client.guilds.cache.get(guildId);
    const logChannel = guild?.channels.cache.find(ch => ch.name === 'mod-logs');
    
    if (logChannel) {
      const embed = this.createLogEmbed(logEntry);
      await logChannel.send({ embeds: [embed] });
    }
    
    return logEntry;
  }

  createLogEmbed(logEntry) {
    const colors = {
      warn: 'yellow',
      mute: 'orange',
      unmute: 'green',
      ban: 'red',
      unban: 'green',
      kick: 'orange'
    };
    
    const embed = {
      title: `🛡️ ${logEntry.action.toUpperCase()}`,
      fields: [
        { name: 'Target', value: `${logEntry.targetTag} (${logEntry.target})`, inline: true },
        { name: 'Moderator', value: `${logEntry.moderatorTag} (${logEntry.moderator})`, inline: true },
        { name: 'Reason', value: logEntry.reason, inline: false }
      ],
      color: colors[logEntry.action] || 'blue',
      timestamp: logEntry.timestamp,
      footer: { text: `Case ID: ${logEntry.id}` }
    };
    
    if (logEntry.duration) {
      embed.fields.push({ name: 'Duration', value: logEntry.duration, inline: true });
    }
    
    return embed;
  }

  async warnCommand(ctx) {
    const target = ctx.getMember('user');
    const reason = ctx.getOption('reason') || 'No reason provided';
    
    if (!target) {
      return ctx.error('❌ User not found in this server!');
    }
    
    if (target.id === ctx.user.id) {
      return ctx.error('❌ You cannot warn yourself!');
    }
    
    if (target.permissions.has('MANAGE_MESSAGES')) {
      return ctx.error('❌ You cannot warn a moderator!');
    }
    
    // Add warning to user's record
    const warnings = await this.bot.db?.getUserConfig(target.id, `warnings_${ctx.guild.id}`, []);
    warnings.push({
      id: Date.now().toString(),
      moderator: ctx.user.id,
      reason,
      timestamp: new Date().toISOString()
    });
    
    await this.bot.db?.setUserConfig(target.id, `warnings_${ctx.guild.id}`, warnings);
    
    // Log the action
    await this.logAction(ctx.guild.id, 'warn', ctx.user, target.user, reason);
    
    const embed = ctx.embed()
      .title('⚠️ User Warned')
      .field('User', target.user.tag, true)
      .field('Moderator', ctx.user.tag, true)
      .field('Reason', reason, false)
      .field('Total Warnings', warnings.length.toString(), true)
      .color('yellow')
      .timestamp();
    
    await embed.send();
    
    // DM the user
    try {
      const dmEmbed = ctx.embed()
        .title(`⚠️ Warning in ${ctx.guild.name}`)
        .field('Reason', reason)
        .field('Moderator', ctx.user.tag)
        .color('yellow');
      
      await target.user.send({ embeds: [dmEmbed.embed] });
    } catch (error) {
      // User has DMs disabled
    }
    
    // Auto-action based on warning count
    if (warnings.length >= 3) {
      try {
        await target.timeout(24 * 60 * 60 * 1000, 'Automatic timeout: 3+ warnings');
        await ctx.channel.send('🔇 User automatically muted for 24 hours (3+ warnings)');
      } catch (error) {
        console.error('Auto-mute failed:', error);
      }
    }
  }

  async warningsCommand(ctx) {
    const target = ctx.getUser('user') || ctx.user;
    const warnings = await this.bot.db?.getUserConfig(target.id, `warnings_${ctx.guild.id}`, []);
    
    if (warnings.length === 0) {
      return ctx.reply(`✅ ${target.tag} has no warnings.`);
    }
    
    const embed = ctx.embed()
      .title(`⚠️ Warnings for ${target.tag}`)
      .color('yellow');
    
    warnings.slice(-5).forEach((warning, index) => {
      const moderator = this.bot.client.users.cache.get(warning.moderator);
      embed.field(
        `Warning ${warnings.length - 4 + index}`,
        `**Reason:** ${warning.reason}\n**Moderator:** ${moderator?.tag || 'Unknown'}\n**Date:** ${new Date(warning.timestamp).toDateString()}`,
        false
      );
    });
    
    if (warnings.length > 5) {
      embed.footer(`Showing latest 5 of ${warnings.length} warnings`);
    }
    
    await embed.send();
  }

  async muteCommand(ctx) {
    const target = ctx.getMember('user');
    const duration = ctx.getOption('duration') || '10m';
    const reason = ctx.getOption('reason') || 'No reason provided';
    
    if (!target) {
      return ctx.error('❌ User not found in this server!');
    }
    
    if (!target.moderatable) {
      return ctx.error('❌ I cannot mute this user!');
    }
    
    const time = require('./utils/time');
    const ms = time.parse(duration);
    
    if (ms === 0 || ms > 28 * 24 * 60 * 60 * 1000) {
      return ctx.error('❌ Invalid duration! Use formats like: 10m, 1h, 1d (max 28 days)');
    }
    
    try {
      await target.timeout(ms, reason);
      
      // Log the action
      await this.logAction(ctx.guild.id, 'mute', ctx.user, target.user, reason, duration);
      
      const embed = ctx.embed()
        .title('🔇 User Muted')
        .field('User', target.user.tag, true)
        .field('Duration', duration, true)
        .field('Moderator', ctx.user.tag, true)
        .field('Reason', reason, false)
        .color('orange')
        .timestamp();
      
      await embed.send();
      
      // DM the user
      try {
        const dmEmbed = ctx.embed()
          .title(`🔇 Muted in ${ctx.guild.name}`)
          .field('Duration', duration)
          .field('Reason', reason)
          .field('Moderator', ctx.user.tag)
          .color('orange');
        
        await target.user.send({ embeds: [dmEmbed.embed] });
      } catch (error) {
        // User has DMs disabled
      }
      
    } catch (error) {
      console.error('Mute error:', error);
      await ctx.error('❌ Failed to mute user!');
    }
  }

  async unmuteCommand(ctx) {
    const target = ctx.getMember('user');
    const reason = ctx.getOption('reason') || 'No reason provided';
    
    if (!target) {
      return ctx.error('❌ User not found in this server!');
    }
    
    if (!target.isCommunicationDisabled()) {
      return ctx.error('❌ User is not muted!');
    }
    
    try {
      await target.timeout(null, reason);
      
      // Log the action
      await this.logAction(ctx.guild.id, 'unmute', ctx.user, target.user, reason);
      
      const embed = ctx.embed()
        .title('🔊 User Unmuted')
        .field('User', target.user.tag, true)
        .field('Moderator', ctx.user.tag, true)
        .field('Reason', reason, false)
        .color('green')
        .timestamp();
      
      await embed.send();
      
    } catch (error) {
      console.error('Unmute error:', error);
      await ctx.error('❌ Failed to unmute user!');
    }
  }

  async banCommand(ctx) {
    const target = ctx.getUser('user');
    const reason = ctx.getOption('reason') || 'No reason provided';
    const deleteDays = ctx.getOption('delete_days') || 0;
    
    if (!target) {
      return ctx.error('❌ User not found!');
    }
    
    const member = ctx.guild.members.cache.get(target.id);
    if (member && !member.bannable) {
      return ctx.error('❌ I cannot ban this user!');
    }
    
    try {
      await ctx.guild.bans.create(target.id, { 
        reason, 
        deleteMessageDays: Math.min(deleteDays, 7) 
      });
      
      // Log the action
      await this.logAction(ctx.guild.id, 'ban', ctx.user, target, reason);
      
      const embed = ctx.embed()
        .title('🔨 User Banned')
        .field('User', target.tag, true)
        .field('Moderator', ctx.user.tag, true)
        .field('Reason', reason, false)
        .color('red')
        .timestamp();
      
      if (deleteDays > 0) {
        embed.field('Messages Deleted', `${deleteDays} days`, true);
      }
      
      await embed.send();
      
      // Try to DM the user before banning
      try {
        const dmEmbed = ctx.embed()
          .title(`🔨 Banned from ${ctx.guild.name}`)
          .field('Reason', reason)
          .field('Moderator', ctx.user.tag)
          .color('red');
        
        await target.send({ embeds: [dmEmbed.embed] });
      } catch (error) {
        // User has DMs disabled or is already banned
      }
      
    } catch (error) {
      console.error('Ban error:', error);
      await ctx.error('❌ Failed to ban user!');
    }
  }

  async unbanCommand(ctx) {
    const userId = ctx.getOption('user_id');
    const reason = ctx.getOption('reason') || 'No reason provided';
    
    if (!userId || !/^\d+$/.test(userId)) {
      return ctx.error('❌ Please provide a valid user ID!');
    }
    
    try {
      const ban = await ctx.guild.bans.fetch(userId);
      if (!ban) {
        return ctx.error('❌ User is not banned!');
      }
      
      await ctx.guild.bans.remove(userId, reason);
      
      // Log the action
      await this.logAction(ctx.guild.id, 'unban', ctx.user, ban.user, reason);
      
      const embed = ctx.embed()
        .title('✅ User Unbanned')
        .field('User', ban.user.tag, true)
        .field('Moderator', ctx.user.tag, true)
        .field('Reason', reason, false)
        .color('green')
        .timestamp();
      
      await embed.send();
      
    } catch (error) {
      console.error('Unban error:', error);
      await ctx.error('❌ Failed to unban user! Make sure the user ID is correct and the user is banned.');
    }
  }

  async modlogsCommand(ctx) {
    const target = ctx.getUser('user');
    const logs = await this.bot.db?.getGuildConfig(ctx.guild.id, 'modLogs', []);
    
    let filteredLogs = logs;
    if (target) {
      filteredLogs = logs.filter(log => log.target === target.id);
    }
    
    if (filteredLogs.length === 0) {
      const message = target ? `No moderation logs found for ${target.tag}.` : 'No moderation logs found.';
      return ctx.reply(message);
    }
    
    // Show latest 10 logs
    const recentLogs = filteredLogs.slice(-10).reverse();
    
    const embed = ctx.embed()
      .title(`🛡️ Moderation Logs${target ? ` - ${target.tag}` : ''}`)
      .color('blue');
    
    recentLogs.forEach(log => {
      const date = new Date(log.timestamp).toLocaleDateString();
      embed.field(
        `${log.action.toUpperCase()} - ${date}`,
        `**Target:** ${log.targetTag}\n**Moderator:** ${log.moderatorTag}\n**Reason:** ${log.reason}${log.duration ? `\n**Duration:** ${log.duration}` : ''}`,
        false
      );
    });
    
    if (filteredLogs.length > 10) {
      embed.footer(`Showing latest 10 of ${filteredLogs.length} logs`);
    }
    
    await embed.send();
  }

  async onMessage(ctx) {
    if (ctx.raw.author.bot || !ctx.guild) return;
    
    // Simple auto-moderation
    const message = ctx.raw.content.toLowerCase();
    const badWords = ['spam', 'badword1', 'badword2']; // Add your bad words
    
    if (badWords.some(word => message.includes(word))) {
      try {
        await ctx.raw.delete();
        
        const embed = ctx.embed()
          .title('🛡️ Message Deleted')
          .desc(`${ctx.user.tag}'s message was deleted for containing inappropriate content.`)
          .color('red');
        
        const msg = await ctx.channel.send({ embeds: [embed.embed] });
        
        // Delete the notification after 5 seconds
        setTimeout(() => {
          msg.delete().catch(() => {});
        }, 5000);
        
      } catch (error) {
        console.error('Auto-mod error:', error);
      }
    }
  }
}

module.exports = ModerationPlugin;
```

## Music Plugin

### Basic Music Bot Plugin

```javascript
const { BasePlugin } = require('@axrxvm/betterdiscordjs');

class MusicPlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    this.name = 'music';
    this.version = '1.0.0';
    this.description = 'Basic music player';
    this.author = 'Your Name';
    
    this.queues = new Map(); // Guild ID -> Queue
  }

  async onLoad() {
    this.logger.info('Loading music plugin...');
    
    // Register commands
    this.registerCommand('play', this.playCommand.bind(this), {
      description: 'Play a song',
      options: [
        { name: 'query', description: 'Song name or URL', type: 3, required: true }
      ],
      slash: true,
      guildOnly: true
    });
    
    this.registerCommand('skip', this.skipCommand.bind(this), {
      description: 'Skip the current song',
      guildOnly: true
    });
    
    this.registerCommand('stop', this.stopCommand.bind(this), {
      description: 'Stop the music and clear queue',
      guildOnly: true
    });
    
    this.registerCommand('queue', this.queueCommand.bind(this), {
      description: 'Show the music queue',
      guildOnly: true
    });
    
    this.registerCommand('nowplaying', this.nowPlayingCommand.bind(this), {
      description: 'Show currently playing song',
      aliases: ['np'],
      guildOnly: true
    });
  }

  getQueue(guildId) {
    if (!this.queues.has(guildId)) {
      this.queues.set(guildId, {
        songs: [],
        playing: false,
        currentSong: null,
        connection: null,
        player: null
      });
    }
    return this.queues.get(guildId);
  }

  async playCommand(ctx) {
    const query = ctx.getOption('query');
    
    if (!ctx.member.voice.channel) {
      return ctx.error('❌ You must be in a voice channel to use music commands!');
    }
    
    const queue = this.getQueue(ctx.guild.id);
    
    // Simulate adding song to queue (in real implementation, you'd use a music library)
    const song = {
      title: query, // In real implementation, fetch from YouTube/Spotify
      url: 'https://example.com/song',
      duration: '3:45',
      requestedBy: ctx.user.tag,
      thumbnail: 'https://example.com/thumbnail.jpg'
    };
    
    queue.songs.push(song);
    
    if (!queue.playing) {
      await this.playSong(ctx, queue);
    } else {
      const embed = ctx.embed()
        .title('📝 Added to Queue')
        .desc(`**${song.title}**`)
        .field('Requested by', song.requestedBy, true)
        .field('Position in queue', queue.songs.length.toString(), true)
        .color('blue');
      
      await embed.send();
    }
  }

  async playSong(ctx, queue) {
    if (queue.songs.length === 0) {
      queue.playing = false;
      return;
    }
    
    const song = queue.songs.shift();
    queue.currentSong = song;
    queue.playing = true;
    
    // In real implementation, you'd connect to voice channel and play audio
    // This is just a simulation
    
    const embed = ctx.embed()
      .title('🎵 Now Playing')
      .desc(`**${song.title}**`)
      .field('Requested by', song.requestedBy, true)
      .field('Duration', song.duration, true)
      .thumbnail(song.thumbnail)
      .color('green');
    
    const msg = await ctx.channel.send({ embeds: [embed.embed] });
    
    // Add music controls
    await msg.react('⏸️'); // Pause
    await msg.react('⏭️'); // Skip
    await msg.react('⏹️'); // Stop
    
    // Simulate song ending after duration (in real implementation, this would be handled by the audio player)
    setTimeout(() => {
      this.playSong(ctx, queue);
    }, 30000); // 30 seconds for demo
  }

  async skipCommand(ctx) {
    if (!ctx.member.voice.channel) {
      return ctx.error('❌ You must be in a voice channel!');
    }
    
    const queue = this.getQueue(ctx.guild.id);
    
    if (!queue.playing) {
      return ctx.error('❌ Nothing is currently playing!');
    }
    
    // In real implementation, you'd stop the current audio and play next
    await ctx.success('⏭️ Skipped the current song!');
    
    // Play next song
    await this.playSong(ctx, queue);
  }

  async stopCommand(ctx) {
    if (!ctx.member.voice.channel) {
      return ctx.error('❌ You must be in a voice channel!');
    }
    
    const queue = this.getQueue(ctx.guild.id);
    
    if (!queue.playing) {
      return ctx.error('❌ Nothing is currently playing!');
    }
    
    // Clear queue and stop playing
    queue.songs = [];
    queue.playing = false;
    queue.currentSong = null;
    
    // In real implementation, you'd disconnect from voice channel
    
    await ctx.success('⏹️ Stopped the music and cleared the queue!');
  }

  async queueCommand(ctx) {
    const queue = this.getQueue(ctx.guild.id);
    
    if (!queue.currentSong && queue.songs.length === 0) {
      return ctx.error('❌ The queue is empty!');
    }
    
    const embed = ctx.embed()
      .title('📝 Music Queue')
      .color('blue');
    
    if (queue.currentSong) {
      embed.field('🎵 Now Playing', `**${queue.currentSong.title}**\nRequested by: ${queue.currentSong.requestedBy}`, false);
    }
    
    if (queue.songs.length > 0) {
      const upcoming = queue.songs.slice(0, 10).map((song, index) => 
        `**${index + 1}.** ${song.title} - ${song.requestedBy}`
      ).join('\n');
      
      embed.field('📋 Up Next', upcoming, false);
      
      if (queue.songs.length > 10) {
        embed.footer(`And ${queue.songs.length - 10} more songs...`);
      }
    }
    
    await embed.send();
  }

  async nowPlayingCommand(ctx) {
    const queue = this.getQueue(ctx.guild.id);
    
    if (!queue.currentSong) {
      return ctx.error('❌ Nothing is currently playing!');
    }
    
    const song = queue.currentSong;
    
    const embed = ctx.embed()
      .title('🎵 Now Playing')
      .desc(`**${song.title}**`)
      .field('Requested by', song.requestedBy, true)
      .field('Duration', song.duration, true)
      .thumbnail(song.thumbnail)
      .color('green');
    
    await embed.send();
  }
}

module.exports = MusicPlugin;
```

## Plugin Best Practices

1. **Always extend BasePlugin**
   ```javascript
   class MyPlugin extends BasePlugin {
     constructor(bot, pluginManager) {
       super(bot, pluginManager);
       // Plugin setup
     }
   }
   ```

2. **Use proper lifecycle methods**
   ```javascript
   async onLoad() {
     // Initialize plugin
   }
   
   async onUnload() {
     // Cleanup resources
   }
   ```

3. **Handle errors gracefully**
   ```javascript
   async onLoad() {
     try {
       await this.initializePlugin();
     } catch (error) {
       this.logger.error('Plugin initialization failed:', error);
       throw error; // Prevent loading
     }
   }
   ```

4. **Use plugin configuration**
   ```javascript
   async onLoad() {
     const config = this.config.get('settings', defaultConfig);
     this.config.set('settings', config);
     await this.config.save();
   }
   ```

5. **Clean up properly**
   ```javascript
   async onUnload() {
     // Clear intervals/timeouts
     if (this.interval) clearInterval(this.interval);
     
     // Unregister events
     this.unregisterAllEvents();
     
     // Close connections
     if (this.connection) await this.connection.close();
   }
   ```

6. **Use dependencies**
   ```javascript
   constructor(bot, pluginManager) {
     super(bot, pluginManager);
     this.dependencies = ['database', 'utility'];
   }
   ```
## Nex
t Steps

Ready to build your own plugins?

1. 🔌 [Creating Plugins](../plugins/creating-plugins.md) - Learn the plugin development process
2. 📚 [Plugin API Reference](../plugins/api-reference.md) - Master the plugin API
3. 🏗️ [Built-in Plugins](../plugins/built-in-plugins.md) - Explore available plugins
4. 🚀 [Advanced Use Cases](./advanced.md) - Implement complex bot architectures






