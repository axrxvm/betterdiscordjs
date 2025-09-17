const BasePlugin = require('../BasePlugin');

/**
 * Welcome Plugin - Sends welcome messages to new members
 */
class WelcomePlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    
    this.name = "welcome";
    this.version = "1.0.0";
    this.description = "Sends welcome messages to new guild members";
    this.author = "axrxvm";
  }

  async onLoad() {
    this.log("Loading Welcome Plugin...");
    
    // Register commands
    this.addCommand('setwelcome', this.setWelcomeCommand.bind(this), {
      description: 'Set the welcome channel and message',
      permissions: ['ManageGuild'],
      args: [
        { name: 'channel', type: 'channel', required: true },
        { name: 'message', type: 'string', required: false }
      ]
    });

    this.addCommand('welcometest', this.testWelcomeCommand.bind(this), {
      description: 'Test the welcome message',
      permissions: ['ManageGuild']
    });

    // Register events
    this.addEvent('guildMemberAdd', this.onMemberJoin.bind(this));
    
    this.log("Welcome Plugin loaded successfully!");
  }

  async onMemberJoin(member) {
    const channelId = await this.getGuildConfig(member.guild.id, 'channel');
    if (!channelId) return;

    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return;

    const customMessage = await this.getGuildConfig(member.guild.id, 'message');
    const message = customMessage || `Welcome to **${member.guild.name}**, {user}! 🎉`;
    
    const welcomeText = message
      .replace('{user}', `<@${member.id}>`)
      .replace('{username}', member.user.username)
      .replace('{guild}', member.guild.name)
      .replace('{memberCount}', member.guild.memberCount.toString());

    try {
      await channel.send(welcomeText);
      this.log(`Sent welcome message for ${member.user.tag} in ${member.guild.name}`);
    } catch (error) {
      this.log(`Failed to send welcome message: ${error.message}`, 'error');
    }
  }

  async setWelcomeCommand(ctx) {
    const channel = ctx.args[0];
    const message = ctx.args.slice(1).join(' ');

    if (!channel || !channel.startsWith('<#')) {
      return ctx.reply('❌ Please provide a valid channel mention.');
    }

    const channelId = channel.slice(2, -1);
    const targetChannel = ctx.guild.channels.cache.get(channelId);
    
    if (!targetChannel) {
      return ctx.reply('❌ Channel not found.');
    }

    await this.setGuildConfig(ctx.guild.id, 'channel', channelId);
    
    if (message) {
      await this.setGuildConfig(ctx.guild.id, 'message', message);
    }

    ctx.reply(`✅ Welcome channel set to ${targetChannel}${message ? `\n📝 Custom message: ${message}` : ''}`);
  }

  async testWelcomeCommand(ctx) {
    const channelId = await this.getGuildConfig(ctx.guild.id, 'channel');
    if (!channelId) {
      return ctx.reply('❌ No welcome channel configured. Use `setwelcome` first.');
    }

    // Simulate member join
    await this.onMemberJoin(ctx.member);
    ctx.reply('✅ Test welcome message sent!');
  }
}

module.exports = WelcomePlugin;


