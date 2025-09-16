const BasePlugin = require('../BasePlugin');

/**
 * AutoMod Plugin - Automatic moderation features
 */
class AutoModPlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    
    this.name = "automod";
    this.version = "1.0.0";
    this.description = "Automatic moderation with spam detection and word filtering";
    this.author = "axrxvm";
    this.dependencies = ["moderation"]; // Requires moderation plugin
    
    this.spamTracker = new Map();
  }

  async onLoad() {
    this.log("Loading AutoMod Plugin...");
    
    // Register commands
    this.addCommand('automod', this.automodCommand.bind(this), {
      description: 'Configure automod settings',
      permissions: ['ManageGuild'],
      args: [
        { name: 'setting', type: 'string', required: true },
        { name: 'value', type: 'string', required: false }
      ]
    });

    this.addCommand('filter', this.filterCommand.bind(this), {
      description: 'Manage word filters',
      permissions: ['ManageMessages'],
      args: [
        { name: 'action', type: 'string', required: true },
        { name: 'word', type: 'string', required: false }
      ]
    });

    // Register events
    this.addEvent('messageCreate', this.onMessage.bind(this));
    this.addEvent('messageUpdate', this.onMessageUpdate.bind(this));
    
    // Clean spam tracker every 5 minutes
    this.addInterval(() => {
      this.cleanSpamTracker();
    }, 5 * 60 * 1000);
    
    this.log("AutoMod Plugin loaded successfully!");
  }

  async onMessage(message) {
    if (message.author.bot || !message.guild) return;
    
    const enabled = await this.getGuildConfig(message.guild.id, 'enabled', false);
    if (!enabled) return;

    // Check spam
    if (await this.checkSpam(message)) return;
    
    // Check word filter
    if (await this.checkWordFilter(message)) return;
    
    // Check excessive caps
    if (await this.checkCaps(message)) return;
    
    // Check excessive mentions
    if (await this.checkMentions(message)) return;
  }

  async onMessageUpdate(oldMessage, newMessage) {
    if (newMessage.author.bot || !newMessage.guild) return;
    
    // Check edited messages for word filter
    await this.checkWordFilter(newMessage);
  }

  async checkSpam(message) {
    const spamEnabled = await this.getGuildConfig(message.guild.id, 'spam.enabled', true);
    if (!spamEnabled) return false;

    const userId = message.author.id;
    const guildId = message.guild.id;
    const key = `${guildId}-${userId}`;
    
    const now = Date.now();
    const timeWindow = await this.getGuildConfig(guildId, 'spam.timeWindow', 5000); // 5 seconds
    const maxMessages = await this.getGuildConfig(guildId, 'spam.maxMessages', 5);
    
    if (!this.spamTracker.has(key)) {
      this.spamTracker.set(key, []);
    }
    
    const userMessages = this.spamTracker.get(key);
    userMessages.push(now);
    
    // Remove old messages outside time window
    const filtered = userMessages.filter(time => now - time < timeWindow);
    this.spamTracker.set(key, filtered);
    
    if (filtered.length >= maxMessages) {
      await this.handleViolation(message, 'spam', `Sent ${filtered.length} messages in ${timeWindow/1000} seconds`);
      
      // Clear tracker for this user
      this.spamTracker.set(key, []);
      return true;
    }
    
    return false;
  }

  async checkWordFilter(message) {
    const filterEnabled = await this.getGuildConfig(message.guild.id, 'filter.enabled', false);
    if (!filterEnabled) return false;

    const bannedWords = await this.getGuildConfig(message.guild.id, 'filter.words', []);
    const content = message.content.toLowerCase();
    
    for (const word of bannedWords) {
      if (content.includes(word.toLowerCase())) {
        await this.handleViolation(message, 'word_filter', `Used banned word: ${word}`);
        return true;
      }
    }
    
    return false;
  }

  async checkCaps(message) {
    const capsEnabled = await this.getGuildConfig(message.guild.id, 'caps.enabled', false);
    if (!capsEnabled) return false;

    const content = message.content;
    if (content.length < 10) return false; // Skip short messages
    
    const capsPercentage = await this.getGuildConfig(message.guild.id, 'caps.percentage', 70);
    const upperCount = (content.match(/[A-Z]/g) || []).length;
    const letterCount = (content.match(/[A-Za-z]/g) || []).length;
    
    if (letterCount > 0 && (upperCount / letterCount) * 100 > capsPercentage) {
      await this.handleViolation(message, 'excessive_caps', `${Math.round((upperCount / letterCount) * 100)}% caps`);
      return true;
    }
    
    return false;
  }

  async checkMentions(message) {
    const mentionEnabled = await this.getGuildConfig(message.guild.id, 'mentions.enabled', false);
    if (!mentionEnabled) return false;

    const maxMentions = await this.getGuildConfig(message.guild.id, 'mentions.max', 5);
    const mentions = message.mentions.users.size + message.mentions.roles.size;
    
    if (mentions > maxMentions) {
      await this.handleViolation(message, 'excessive_mentions', `${mentions} mentions (max: ${maxMentions})`);
      return true;
    }
    
    return false;
  }

  async handleViolation(message, type, details) {
    const action = await this.getGuildConfig(message.guild.id, `${type}.action`, 'delete');
    
    try {
      // Delete the message
      if (action === 'delete' || action === 'warn' || action === 'timeout') {
        await message.delete();
      }
      
      // Take additional action
      if (action === 'warn') {
        const modPlugin = this.pluginManager.getPlugin('moderation');
        if (modPlugin) {
          // Add warning through moderation plugin
          const db = modPlugin.getDB();
          const warnings = db.get(`warnings.${message.guild.id}.${message.author.id}`) || [];
          
          const warning = {
            id: Date.now(),
            reason: `AutoMod: ${type} - ${details}`,
            moderator: this.bot.client.user.id,
            timestamp: new Date().toISOString()
          };

          warnings.push(warning);
          db.set(`warnings.${message.guild.id}.${message.author.id}`, warnings);
        }
      } else if (action === 'timeout') {
        const duration = await this.getGuildConfig(message.guild.id, `${type}.duration`, 300000); // 5 minutes
        await message.member.timeout(duration, `AutoMod: ${type} - ${details}`);
      }
      
      // Send notification
      const notifyUser = await this.getGuildConfig(message.guild.id, 'notifyUser', true);
      if (notifyUser) {
        const channel = message.channel;
        const notification = await channel.send(
          `⚠️ ${message.author}, your message was removed for: **${type.replace('_', ' ')}** (${details})`
        );
        
        // Delete notification after 10 seconds
        setTimeout(() => notification.delete().catch(() => {}), 10000);
      }
      
      // Log the action
      await this.logViolation(message, type, details, action);
      
    } catch (error) {
      this.log(`Failed to handle violation: ${error.message}`, 'error');
    }
  }

  async logViolation(message, type, details, action) {
    const logChannelId = await this.getGuildConfig(message.guild.id, 'logChannel');
    if (!logChannelId) return;

    const logChannel = this.bot.client.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = {
      color: 0xffa500,
      title: '🤖 AutoMod Action',
      fields: [
        { name: 'User', value: `<@${message.author.id}>`, inline: true },
        { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
        { name: 'Violation', value: type.replace('_', ' '), inline: true },
        { name: 'Details', value: details, inline: false },
        { name: 'Action', value: action, inline: true },
        { name: 'Message Content', value: message.content.slice(0, 1000) || 'No content', inline: false }
      ],
      timestamp: new Date().toISOString()
    };

    try {
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      this.log(`Failed to send log message: ${error.message}`, 'error');
    }
  }

  async automodCommand(ctx) {
    const setting = ctx.args[0];
    const value = ctx.args[1];

    const validSettings = [
      'enabled', 'spam.enabled', 'filter.enabled', 'caps.enabled', 'mentions.enabled',
      'spam.timeWindow', 'spam.maxMessages', 'caps.percentage', 'mentions.max',
      'notifyUser', 'logChannel'
    ];

    if (!validSettings.includes(setting)) {
      return ctx.reply(`❌ Invalid setting. Valid options: ${validSettings.join(', ')}`);
    }

    if (!value) {
      const current = await this.getGuildConfig(ctx.guild.id, setting);
      return ctx.reply(`📋 Current value for \`${setting}\`: ${current}`);
    }

    let parsedValue = value;
    if (value === 'true') parsedValue = true;
    else if (value === 'false') parsedValue = false;
    else if (!isNaN(value)) parsedValue = parseInt(value);

    await this.setGuildConfig(ctx.guild.id, setting, parsedValue);
    ctx.reply(`✅ Set \`${setting}\` to \`${parsedValue}\``);
  }

  async filterCommand(ctx) {
    const action = ctx.args[0];
    const word = ctx.args.slice(1).join(' ');

    if (!['add', 'remove', 'list'].includes(action)) {
      return ctx.reply('❌ Valid actions: add, remove, list');
    }

    const bannedWords = await this.getGuildConfig(ctx.guild.id, 'filter.words', []);

    if (action === 'list') {
      if (bannedWords.length === 0) {
        return ctx.reply('📋 No banned words configured.');
      }
      return ctx.reply(`📋 Banned words: ${bannedWords.map(w => `\`${w}\``).join(', ')}`);
    }

    if (!word) {
      return ctx.reply('❌ Please provide a word to add/remove.');
    }

    if (action === 'add') {
      if (bannedWords.includes(word)) {
        return ctx.reply('❌ Word is already banned.');
      }
      bannedWords.push(word);
      await this.setGuildConfig(ctx.guild.id, 'filter.words', bannedWords);
      ctx.reply(`✅ Added \`${word}\` to banned words.`);
    } else if (action === 'remove') {
      const index = bannedWords.indexOf(word);
      if (index === -1) {
        return ctx.reply('❌ Word is not in the banned list.');
      }
      bannedWords.splice(index, 1);
      await this.setGuildConfig(ctx.guild.id, 'filter.words', bannedWords);
      ctx.reply(`✅ Removed \`${word}\` from banned words.`);
    }
  }

  cleanSpamTracker() {
    const now = Date.now();
    const maxAge = 60000; // 1 minute
    
    for (const [key, messages] of this.spamTracker) {
      const filtered = messages.filter(time => now - time < maxAge);
      if (filtered.length === 0) {
        this.spamTracker.delete(key);
      } else {
        this.spamTracker.set(key, filtered);
      }
    }
  }
}

module.exports = AutoModPlugin;