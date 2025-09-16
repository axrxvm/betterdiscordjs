const { EmbedBuilder } = require('discord.js');

class BetterEmbed {
  constructor(ctx) {
    this.ctx = ctx;
    this.embed = new EmbedBuilder();
    this.embed.setTimestamp();
    this.embed.setFooter({ text: ctx.bot?.client?.user?.username || 'Bot' });
    this.embed.setColor(0x5865F2); // Default blue
    this._fields = [];
  }
  title(t) { this.embed.setTitle(t); return this; }
  desc(d) { this.embed.setDescription(d); return this; }
  color(c) {
    if (typeof c === 'string') {
      const map = { blue: 0x5865F2, green: 0x57F287, red: 0xED4245, yellow: 0xFEE75C };
      this.embed.setColor(map[c.toLowerCase()] || c);
    } else {
      this.embed.setColor(c);
    }
    return this;
  }
  field(name, value, inline = false) {
    if (this._fields.length < 25) {
      this._fields.push({ name, value: value?.toString()?.slice(0, 1024), inline });
    }
    return this;
  }
  author(name, icon) { this.embed.setAuthor({ name, iconURL: icon }); return this; }
  footer(text, icon) { this.embed.setFooter({ text, iconURL: icon }); return this; }
  thumbnail(url) { this.embed.setThumbnail(url); return this; }
  image(url) { this.embed.setImage(url); return this; }
  send(options = {}) {
    if (this._fields.length) this.embed.setFields(this._fields);
    return this.ctx.reply({ embeds: [this.embed], ...options });
  }
  edit(msg, options = {}) {
    if (this._fields.length) this.embed.setFields(this._fields);
    return msg.edit({ embeds: [this.embed], ...options });
  }
}
class Ctx {
  /** One-liner embed or builder */
  embed(content) {
    if (typeof content === 'string') {
      return this.reply({ embeds: [new EmbedBuilder().setDescription(content).setColor(0x5865F2).setTimestamp().setFooter({ text: this.bot?.client?.user?.username || 'Bot' })] });
    }
    return new BetterEmbed(this);
  }

  /** Preset templates */
  success(msg) {
    return this.reply({ embeds: [new EmbedBuilder().setDescription('✅ ' + msg).setColor(0x57F287).setTimestamp().setFooter({ text: this.bot?.client?.user?.username || 'Bot' })] });
  }
  error(msg) {
    return this.reply({ embeds: [new EmbedBuilder().setDescription('❌ ' + msg).setColor(0xED4245).setTimestamp().setFooter({ text: this.bot?.client?.user?.username || 'Bot' })] });
  }
  info(msg) {
    return this.reply({ embeds: [new EmbedBuilder().setDescription('ℹ️ ' + msg).setColor(0x5865F2).setTimestamp().setFooter({ text: this.bot?.client?.user?.username || 'Bot' })] });
  }
  warn(msg) {
    return this.reply({ embeds: [new EmbedBuilder().setDescription('⚠️ ' + msg).setColor(0xFEE75C).setTimestamp().setFooter({ text: this.bot?.client?.user?.username || 'Bot' })] });
  }
  /** Await a message from the user with filter and timeout */
  async awaitMessage(filter, options = {}) {
    return await this.channel.awaitMessages({ filter, max: 1, time: options.time || 30000, errors: ['time'] })
      .then(col => col.first())
      .catch(() => null);
  }

  /** Await a reaction from the user, optionally restrict to emojis */
  async awaitReaction(emojis, options = {}) {
    const filter = (r, u) => u.id === this.user.id && (!emojis || emojis.includes(r.emoji.name));
    return await this.raw.awaitReactions({ filter, max: 1, time: options.time || 30000, errors: ['time'] })
      .then(col => col.first())
      .catch(() => null);
  }

  /** Await a component interaction (button, select, etc) */
  async awaitComponent(type, filter, timeout = 30000) {
    const collector = this.raw.createMessageComponentCollector({ componentType: type, filter, time: timeout });
    return new Promise(resolve => {
      collector.on('collect', i => resolve(i));
      collector.on('end', () => resolve(null));
    });
  }

  /** Paginator API: paginate pages with custom buttons */
  async paginate(pages, options = {}) {
    let page = 0;
    const buttons = (options.buttons || ['⬅️', '➡️']).map((label, i) => this.button(label, { style: i ? 'primary' : 'secondary' }));
    const row = require('discord.js').ActionRowBuilder.from({ components: buttons });
    const msg = await this.reply({ embeds: [pages[page]], components: [row] });
    const collector = msg.createMessageComponentCollector({ time: options.time || 30000 });
    collector.on('collect', i => {
      if (i.customId === buttons[0].data.label) page = (page - 1 + pages.length) % pages.length;
      if (i.customId === buttons[1].data.label) page = (page + 1) % pages.length;
      i.update({ embeds: [pages[page]], components: [row] });
    });
    return msg;
  }

  /** UI: create a button with handler */
  button(label, options = {}, handler) {
    const { ButtonBuilder } = require('discord.js');
    const styleMap = { success: 3, danger: 4, primary: 1, secondary: 2, link: 5 };
    const btn = new ButtonBuilder()
      .setCustomId(options.customId || label)
      .setLabel(label)
      .setStyle(styleMap[options.style] || 1);
    if (handler) btn.handler = handler;
    btn.data = { label };
    return btn;
  }

  /** UI: create a select menu */
  menu(options, handler) {
    const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
    const menu = new StringSelectMenuBuilder()
      .setCustomId('menu_' + Date.now())
      .addOptions(options.map(opt => ({ label: opt, value: opt })));
    const row = new ActionRowBuilder().addComponents(menu);
    if (handler) menu.handler = handler;
    return row;
  }

  /** Embed templates */
  success(msg) {
    return this.embed({ description: msg, color: 0x57F287 });
  }
  error(msg) {
    return this.embed({ description: msg, color: 0xED4245 });
  }
  info(msg) {
    return this.embed({ description: msg, color: 0x5865F2 });
  }

  /** Markdown helpers */
  bold(str) { return `**${str}**`; }
  italic(str) { return `*${str}*`; }
  code(str) { return `${str}`; }
  /** Show a Discord modal for multi-field input */
  async modal(fields, options = {}) {
    const { ModalBuilder, TextInputBuilder, ActionRowBuilder } = require('discord.js');
    if (!this.isInteraction || !this.raw.showModal) throw new Error('Modals require an interaction context');
    const modal = new ModalBuilder()
      .setCustomId(options.customId || 'modal_' + Date.now())
      .setTitle(options.title || 'Input');
    fields.forEach(f => {
      const input = new TextInputBuilder()
        .setCustomId(f.customId)
        .setLabel(f.label)
        .setStyle(f.style || 1)
        .setRequired(!!f.required);
      modal.addComponents(new ActionRowBuilder().addComponents(input));
    });
    await this.raw.showModal(modal);
    // Wait for modal submit
    const filter = i => i.customId === modal.data.custom_id && i.user.id === this.user.id;
    const submitted = await this.raw.awaitModalSubmit({ filter, time: options.timeout || 30000 }).catch(() => null);
    if (!submitted) return null;
    const result = {};
    fields.forEach(f => {
      result[f.customId] = submitted.fields.getTextInputValue(f.customId);
    });
    await submitted.reply({ content: options.thankYou || 'Thank you!', ephemeral: true });
    return result;
  }
  /** Multi-step dialog: ask questions, collect answers */
  async dialog(steps, options = {}) {
    const answers = [];
    for (const prompt of steps) {
      await this.reply(prompt);
      const reply = await this.waitFor(
        "message",
        m => m.author.id === this.user.id && m.channel.id === this.channel.id,
        options.timeout || 30000
      );
      if (!reply) {
        await this.reply("⏳ Dialog timed out.");
        break;
      }
      answers.push(reply.content);
    }
    return answers;
  }
  /** Await button interactions and handle by customId, with default 30s timeout and timeout message edit */
  async awaitButton(msg, handlers, options = {}) {
    const timeout = options.time ?? 30000;
    const collector = msg.createMessageComponentCollector({ ...options, time: timeout });
    let interacted = false;
    collector.on("collect", async interaction => {
      interacted = true;
      if (handlers[interaction.customId]) {
        await handlers[interaction.customId](interaction);
      }
    });
    collector.on("end", async () => {
      if (!interacted) {
        await msg.edit({ content: "⏳ Timed out!", components: [] });
      }
    });
    return collector;
  }
  /** Delete invoking message or interaction */
  async delete() {
    if (this.isInteraction && this.raw.deferred) {
      return this.raw.deleteReply();
    }
    if (this.raw.delete) {
      return this.raw.delete();
    }
    throw new Error('Cannot delete this context');
  }

  /** Paginator system: embed pages with ⬅️➡️ buttons */
  async paginator(pages, options = {}) {
    // pages: array of embed objects
    let page = 0;
    const row = this.buttonRow([
      { customId: 'prev', label: '⬅️', style: 2 },
      { customId: 'next', label: '➡️', style: 2 }
    ]);
    const msg = await this.reply({ embeds: [pages[page]], components: [row], ...options });
    const collector = msg.createMessageComponentCollector({ time: 60000 });
    collector.on('collect', i => {
      if (i.customId === 'prev') page = (page - 1 + pages.length) % pages.length;
      if (i.customId === 'next') page = (page + 1) % pages.length;
      i.update({ embeds: [pages[page]], components: [row] });
    });
    return msg;
  }

  /** Create a button row from array of button data */
  buttonRow(buttons) {
    const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
    return new ActionRowBuilder().addComponents(
      buttons.map(b => new ButtonBuilder().setCustomId(b.customId).setLabel(b.label).setStyle(b.style || 2))
    );
  }

  /** Wait for message or reaction with filter and timeout */
  async waitFor(type, filter, timeout = 15000) {
    if (type === 'message') {
      return await this.channel.awaitMessages({ filter, max: 1, time: timeout, errors: ['time'] })
        .then(col => col.first())
        .catch(() => null);
    }
    if (type === 'reaction') {
      return await this.raw.awaitReactions({ filter, max: 1, time: timeout, errors: ['time'] })
        .then(col => col.first())
        .catch(() => null);
    }
    throw new Error('Unknown waitFor type');
  }

  /** Auto-parse mentions in args to ctx.args.user, ctx.args.channel, etc */
  _parseArgs(raw) {
    if (this.isInteraction) {
      return raw.options.data.map(opt => opt.value);
    }
    if (raw?.content) {
      const args = raw.content.trim().split(/\s+/).slice(1);
      // Parse user/channel mentions
      const userMatch = args.find(a => /^<@!?\d+>$/.test(a));
      const channelMatch = args.find(a => /^<#\d+>$/.test(a));
      return Object.assign(args, {
        user: userMatch ? userMatch.replace(/<@!?|>/g, '') : null,
        channel: channelMatch ? channelMatch.replace(/<#|>/g, '') : null
      });
    }
    return [];
  }

  /** Pick a random element from an array */
  randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  /** Send a DM to a user (User object or ID) */
  async dm(user, content) {
    let userObj = user;
    if (typeof user === 'string') {
      userObj = await this.fetchUser(user);
    }
    if (!userObj || !userObj.send) throw new Error('Invalid user');
    return await userObj.send(content);
  }
  /** Fetch a user by ID */
  async fetchUser(id) {
    return await this.bot.client.users.fetch(id);
  }

  /** Fetch a member by ID (in current guild) */
  async fetchMember(id) {
    if (!this.guild) throw new Error('No guild context');
    return await this.guild.members.fetch(id);
  }
  constructor(raw, bot, argsOverride = null) {
    this.raw = raw;
    this.bot = bot;
    this.isInteraction = raw?.isCommand?.();
    this.user = raw?.user || raw?.author;
    this.guild = raw?.guild || null;
    this.channel = raw?.channel || null;
    this.member = raw?.member || null;

    this.args = argsOverride || this._parseArgs(raw);
    this.options = this.isInteraction ? raw.options.data : [];
    this.isDM = !this.guild;
    this.isGuild = !!this.guild;
  }

  _parseArgs(raw) {
    if (this.isInteraction) {
      return raw.options.data.map(opt => opt.value);
    }
    if (raw?.content) {
      return raw.content.trim().split(/\s+/).slice(1);
    }
    return [];
  }

  async reply(content, options = {}) {
    if (this.isInteraction) {
      return this.raw.reply({ content, ...options });
    }
    return this.raw.reply(content, options);
  }

  async embed(embedObj) {
    return this.reply({ embeds: [embedObj] });
  }

  async react(emoji) {
    if (!this.raw.react) return;
    return this.raw.react(emoji);
  }

  async file(filePath) {
    return this.reply({ files: [filePath] });
  }

  async defer() {
    if (this.isInteraction) return this.raw.deferReply();
  }

  async followUp(content) {
    if (this.isInteraction) return this.raw.followUp(content);
  }

  hasPerms(perms) {
    if (!this.member || !this.member.permissions) return false;
    return this.member.permissions.has(perms);
  }
}

module.exports = Ctx;
