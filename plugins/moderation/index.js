const BasePlugin = require('../BasePlugin');

/**
 * Moderation Plugin - Basic moderation commands
 */
class ModerationPlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    
    this.name = "moderation";
    this.version = "1.0.0";
    this.description = "Basic moderation commands for server management";
    this.author = "axrxvm";
  }

  async onLoad() {
    this.log("Loading Moderation Plugin...");
    
    // Register commands
    this.addCommand('kick', this.kickCommand.bind(this), {
      description: 'Kick a member from the server',
      permissions: ['KickMembers'],
      args: [
        { name: 'user', type: 'user', required: true },
        { name: 'reason', type: 'string', required: false }
      ]
    });

    this.addCommand('ban', this.banCommand.bind(this), {
      description: 'Ban a member from the server',
      permissions: ['BanMembers'],
      args: [
        { name: 'user', type: 'user', required: true },
        { name: 'reason', type: 'string', required: false }
      ]
    });

    this.addCommand('timeout', this.timeoutCommand.bind(this), {
      description: 'Timeout a member',
      permissions: ['ModerateMembers'],
      args: [
        { name: 'user', type: 'user', required: true },
        { name: 'duration', type: 'string', required: true },
        { name: 'reason', type: 'string', required: false }
      ]
    });

    this.addCommand('purge', this.purgeCommand.bind(this), {
      description: 'Delete multiple messages',
      permissions: ['ManageMessages'],
      args: [
        { name: 'amount', type: 'number', required: true }
      ]
    });

    this.addCommand('warn', this.warnCommand.bind(this), {
      description: 'Warn a member',
      permissions: ['ModerateMembers'],
      args: [
        { name: 'user', type: 'user', required: true },
        { name: 'reason', type: 'string', required: true }
      ]
    });

    this.addCommand('warnings', this.warningsCommand.bind(this), {
      description: 'View warnings for a member',
      permissions: ['ModerateMembers'],
      args: [
        { name: 'user', type: 'user', required: true }
      ]
    });
    
    this.log("Moderation Plugin loaded successfully!");
  }

  async kickCommand(ctx) {
    const userMention = ctx.args[0];
    const reason = ctx.args.slice(1).join(' ') || 'No reason provided';

    if (!userMention || !userMention.startsWith('<@')) {
      return ctx.reply('❌ Please mention a valid user to kick.');
    }

    const userId = userMention.replace(/[<@!>]/g, '');
    const member = ctx.guild.members.cache.get(userId);

    if (!member) {
      return ctx.reply('❌ User not found in this server.');
    }

    if (!member.kickable) {
      return ctx.reply('❌ I cannot kick this user.');
    }

    try {
      await member.kick(reason);
      ctx.reply(`✅ Kicked ${member.user.tag} for: ${reason}`);
      this.logAction('kick', ctx.user, member.user, reason);
    } catch (error) {
      ctx.reply('❌ Failed to kick the user.');
      this.log(`Failed to kick ${member.user.tag}: ${error.message}`, 'error');
    }
  }

  async banCommand(ctx) {
    const userMention = ctx.args[0];
    const reason = ctx.args.slice(1).join(' ') || 'No reason provided';

    if (!userMention || !userMention.startsWith('<@')) {
      return ctx.reply('❌ Please mention a valid user to ban.');
    }

    const userId = userMention.replace(/[<@!>]/g, '');
    const member = ctx.guild.members.cache.get(userId);

    if (member && !member.bannable) {
      return ctx.reply('❌ I cannot ban this user.');
    }

    try {
      await ctx.guild.members.ban(userId, { reason });
      const user = member ? member.user : await this.bot.client.users.fetch(userId);
      ctx.reply(`✅ Banned ${user.tag} for: ${reason}`);
      this.logAction('ban', ctx.user, user, reason);
    } catch (error) {
      ctx.reply('❌ Failed to ban the user.');
      this.log(`Failed to ban user ${userId}: ${error.message}`, 'error');
    }
  }

  async timeoutCommand(ctx) {
    const userMention = ctx.args[0];
    const duration = ctx.args[1];
    const reason = ctx.args.slice(2).join(' ') || 'No reason provided';

    if (!userMention || !userMention.startsWith('<@')) {
      return ctx.reply('❌ Please mention a valid user to timeout.');
    }

    const userId = userMention.replace(/[<@!>]/g, '');
    const member = ctx.guild.members.cache.get(userId);

    if (!member) {
      return ctx.reply('❌ User not found in this server.');
    }

    // Parse duration (simple implementation)
    const timeMs = this.parseDuration(duration);
    if (!timeMs) {
      return ctx.reply('❌ Invalid duration format. Use: 1m, 1h, 1d');
    }

    try {
      await member.timeout(timeMs, reason);
      ctx.reply(`✅ Timed out ${member.user.tag} for ${duration}. Reason: ${reason}`);
      this.logAction('timeout', ctx.user, member.user, `${duration} - ${reason}`);
    } catch (error) {
      ctx.reply('❌ Failed to timeout the user.');
      this.log(`Failed to timeout ${member.user.tag}: ${error.message}`, 'error');
    }
  }

  async purgeCommand(ctx) {
    const amount = parseInt(ctx.args[0]);

    if (isNaN(amount) || amount < 1 || amount > 100) {
      return ctx.reply('❌ Please provide a number between 1 and 100.');
    }

    try {
      const messages = await ctx.channel.bulkDelete(amount, true);
      const reply = await ctx.reply(`✅ Deleted ${messages.size} messages.`);
      
      // Delete the confirmation message after 5 seconds
      setTimeout(() => reply.delete().catch(() => {}), 5000);
      
      this.logAction('purge', ctx.user, null, `${messages.size} messages`);
    } catch (error) {
      ctx.reply('❌ Failed to delete messages.');
      this.log(`Failed to purge messages: ${error.message}`, 'error');
    }
  }

  async warnCommand(ctx) {
    const userMention = ctx.args[0];
    const reason = ctx.args.slice(1).join(' ');

    if (!userMention || !userMention.startsWith('<@')) {
      return ctx.reply('❌ Please mention a valid user to warn.');
    }

    if (!reason) {
      return ctx.reply('❌ Please provide a reason for the warning.');
    }

    const userId = userMention.replace(/[<@!>]/g, '');
    const member = ctx.guild.members.cache.get(userId);

    if (!member) {
      return ctx.reply('❌ User not found in this server.');
    }

    // Store warning in database
    const db = this.getDB();
    const warnings = db.get(`warnings.${ctx.guild.id}.${userId}`) || [];
    
    const warning = {
      id: Date.now(),
      reason,
      moderator: ctx.user.id,
      timestamp: new Date().toISOString()
    };

    warnings.push(warning);
    db.set(`warnings.${ctx.guild.id}.${userId}`, warnings);

    ctx.reply(`✅ Warned ${member.user.tag} for: ${reason}\n📊 Total warnings: ${warnings.length}`);
    this.logAction('warn', ctx.user, member.user, reason);

    // DM the user
    try {
      await member.send(`⚠️ You have been warned in **${ctx.guild.name}** for: ${reason}`);
    } catch (error) {
      // User has DMs disabled
    }
  }

  async warningsCommand(ctx) {
    const userMention = ctx.args[0];

    if (!userMention || !userMention.startsWith('<@')) {
      return ctx.reply('❌ Please mention a valid user to check warnings.');
    }

    const userId = userMention.replace(/[<@!>]/g, '');
    const member = ctx.guild.members.cache.get(userId);

    if (!member) {
      return ctx.reply('❌ User not found in this server.');
    }

    const db = this.getDB();
    const warnings = db.get(`warnings.${ctx.guild.id}.${userId}`) || [];

    if (warnings.length === 0) {
      return ctx.reply(`✅ ${member.user.tag} has no warnings.`);
    }

    const warningList = warnings.slice(-5).map((w, i) => 
      `${i + 1}. **${w.reason}** - <@${w.moderator}> (${new Date(w.timestamp).toLocaleDateString()})`
    ).join('\n');

    ctx.reply(`⚠️ **Warnings for ${member.user.tag}** (${warnings.length} total):\n${warningList}`);
  }

  parseDuration(duration) {
    const match = duration.match(/^(\d+)([mhd])$/);
    if (!match) return null;

    const [, amount, unit] = match;
    const multipliers = { m: 60000, h: 3600000, d: 86400000 };
    
    return parseInt(amount) * multipliers[unit];
  }

  async logAction(action, moderator, target, details) {
    const logChannelId = await this.getGuildConfig(moderator.guild?.id, 'logChannel');
    if (!logChannelId) return;

    const logChannel = this.bot.client.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = {
      color: 0xff6b6b,
      title: `🔨 Moderation Action: ${action.toUpperCase()}`,
      fields: [
        { name: 'Moderator', value: `<@${moderator.id}>`, inline: true },
        { name: 'Target', value: target ? `<@${target.id}>` : 'N/A', inline: true },
        { name: 'Details', value: details, inline: false }
      ],
      timestamp: new Date().toISOString()
    };

    try {
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      this.log(`Failed to send log message: ${error.message}`, 'error');
    }
  }
}

module.exports = ModerationPlugin;