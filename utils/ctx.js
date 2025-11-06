const { 
  EmbedBuilder, 
  AttachmentBuilder, 
  ModalBuilder, 
  TextInputBuilder,
  TextInputStyle,
  PermissionFlagsBits 
} = require('discord.js');
const { ComponentBuilder, BetterButton, BetterSelectMenu, BetterRow } = require('./components');

/**
 * A builder for creating rich embeds with a fluent API.
 * @class
 */
class BetterEmbed {
  /**
   * Creates an instance of BetterEmbed.
   * @param {Ctx} ctx - The context object.
   */
  constructor(ctx) {
    this.ctx = ctx;
    this.embed = new EmbedBuilder();
    this.embed.setTimestamp();
    this.embed.setFooter({ text: ctx.bot?.client?.user?.username || 'Bot' });
    this.embed.setColor(0x5865F2); // Default blue
    this._fields = [];
  }

  /**
   * Sets the title of the embed.
   * @param {string} t - The title text.
   * @returns {BetterEmbed} The embed builder instance.
   */
  title(t) { this.embed.setTitle(t); return this; }

  /**
   * Sets the description of the embed.
   * @param {string} d - The description text.
   * @returns {BetterEmbed} The embed builder instance.
   */
  desc(d) { this.embed.setDescription(d); return this; }

  /**
   * Sets the color of the embed.
   * @param {string|number} c - The color.
   * @returns {BetterEmbed} The embed builder instance.
   */
  color(c) {
    if (typeof c === 'string') {
      const map = {
        blue: 0x5865F2,
        green: 0x57F287,
        red: 0xED4245,
        yellow: 0xFEE75C,
        purple: 0x9B59B6,
        orange: 0xE67E22,
        gold: 0xF1C40F,
        random: Math.floor(Math.random() * 16777215) // Generate random color
      };
      this.embed.setColor(map[c.toLowerCase()] || c);
    } else {
      this.embed.setColor(c);
    }
    return this;
  }

  /**
   * Adds a field to the embed.
   * @param {string} name - The name of the field.
   * @param {string} value - The value of the field.
   * @param {boolean} [inline=false] - Whether the field should be inline.
   * @returns {BetterEmbed} The embed builder instance.
   */
  field(name, value, inline = false) {
    if (this._fields.length < 25) {
      this._fields.push({ name, value: value?.toString()?.slice(0, 1024), inline });
    }
    return this;
  }

  /**
   * Sets the author of the embed.
   * @param {string} name - The author's name.
   * @param {string} icon - The author's icon URL.
   * @returns {BetterEmbed} The embed builder instance.
   */
  author(name, icon) { this.embed.setAuthor({ name, iconURL: icon }); return this; }

  /**
   * Sets the footer of the embed.
   * @param {string} text - The footer text.
   * @param {string} icon - The footer icon URL.
   * @returns {BetterEmbed} The embed builder instance.
   */
  footer(text, icon) { this.embed.setFooter({ text, iconURL: icon }); return this; }

  /**
   * Sets the thumbnail of the embed.
   * @param {string} url - The thumbnail URL.
   * @returns {BetterEmbed} The embed builder instance.
   */
  thumbnail(url) { this.embed.setThumbnail(url); return this; }

  /**
   * Sets the image of the embed.
   * @param {string} url - The image URL.
   * @returns {BetterEmbed} The embed builder instance.
   */
  image(url) { this.embed.setImage(url); return this; }

  /**
   * Sets the timestamp of the embed.
   * @param {Date|number} [time] - The timestamp (defaults to current time).
   * @returns {BetterEmbed} The embed builder instance.
   */
  timestamp(time) { this.embed.setTimestamp(time); return this; }

  /**
   * Sends the embed to the channel.
   * @param {object} [options={}] - The message options.
   * @returns {Promise<Message>} The sent message.
   */
  send(options = {}) {
    if (this._fields.length) this.embed.setFields(this._fields);
    return this.ctx.reply({ embeds: [this.embed], ...options });
  }

  /**
   * Edits a message with the embed.
   * @param {Message} msg - The message to edit.
   * @param {object} [options={}] - The message options.
   * @returns {Promise<Message>} The edited message.
   */
  edit(msg, options = {}) {
    if (this._fields.length) this.embed.setFields(this._fields);
    return msg.edit({ embeds: [this.embed], ...options });
  }
}

/**
 * The context object, provides a unified interface for interacting with commands and events.
 * @class
 */
class Ctx {
  /**
   * Creates an instance of Ctx.
   * @param {Interaction|Message} raw - The raw interaction or message object.
   * @param {Bot} bot - The bot instance.
   * @param {Array<string>} [argsOverride=null] - The arguments override.
   */
  constructor(raw, bot, argsOverride = null) {
    this.raw = raw;
    this.bot = bot;
    this.client = bot.client;
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

  /**
   * Parses the arguments from the raw object.
   * @param {Interaction|Message} raw - The raw interaction or message object.
   * @returns {Array<string>} The parsed arguments.
   * @private
   */
  _parseArgs(raw) {
    if (this.isInteraction) {
      return raw.options.data.map(opt => opt.value);
    }
    if (raw?.content) {
      const args = raw.content.trim().split(/\s+/).slice(1);
      const userMatch = args.find(a => /^<@!?\d+>$/.test(a));
      const channelMatch = args.find(a => /^<#\d+>$/.test(a));
      return Object.assign(args, {
        user: userMatch ? userMatch.replace(/<@!?|>/g, '') : null,
        channel: channelMatch ? channelMatch.replace(/<#|>/g, '') : null
      });
    }
    return [];
  }

  /**
   * Gets an option value from slash command options.
   * @param {string} name - The name of the option.
   * @returns {*} The option value or null if not found.
   */
  getOption(name) {
    if (!this.isInteraction) return null;
    const option = this.options.find(opt => opt.name === name);
    return option ? option.value : null;
  }

  /**
   * Gets a user from slash command options.
   * @param {string} name - The name of the user option.
   * @returns {User|null} The user object or null if not found.
   */
  getUser(name) {
    if (!this.isInteraction) return null;
    const option = this.options.find(opt => opt.name === name && opt.type === 6); // USER type
    return option ? option.user : null;
  }

  /**
   * Gets a member from slash command options.
   * @param {string} name - The name of the member option.
   * @returns {GuildMember|null} The member object or null if not found.
   */
  getMember(name) {
    if (!this.isInteraction) return null;
    const option = this.options.find(opt => opt.name === name && opt.type === 6); // USER type
    return option ? option.member : null;
  }

  /**
   * Gets a channel from slash command options.
   * @param {string} name - The name of the channel option.
   * @returns {Channel|null} The channel object or null if not found.
   */
  getChannel(name) {
    if (!this.isInteraction) return null;
    const option = this.options.find(opt => opt.name === name && opt.type === 7); // CHANNEL type
    return option ? option.channel : null;
  }

  /**
   * Gets a role from slash command options.
   * @param {string} name - The name of the role option.
   * @returns {Role|null} The role object or null if not found.
   */
  getRole(name) {
    if (!this.isInteraction) return null;
    const option = this.options.find(opt => opt.name === name && opt.type === 8); // ROLE type
    return option ? option.role : null;
  }

  /**
   * Sends a reply to the channel.
   * @param {string|object} content - The content of the reply.
   * @param {object} [options={}] - The message options.
   * @returns {Promise<Message>} The sent message.
   */
  async reply(content, options = {}) {
    if (this.isInteraction) {
      // If interaction is deferred, use followUp instead of reply
      if (this.raw.deferred) {
        if (typeof content === 'object' && content !== null) {
          return this.raw.followUp({ ...content, ...options });
        }
        return this.raw.followUp({ content, ...options });
      }

      // If content is an object (like { embeds: [...] }), use it directly
      if (typeof content === 'object' && content !== null) {
        return this.raw.reply({ ...content, ...options });
      }
      return this.raw.reply({ content, ...options });
    }
    return this.raw.reply(content, options);
  }

  /**
   * Sends an embed to the channel.
   * @param {string|EmbedBuilder} content - The content of the embed.
   * @returns {Promise<Message>|BetterEmbed} The sent message or embed builder.
   */
  embed(content) {
    if (typeof content === 'string') {
      return this.reply({ embeds: [new EmbedBuilder().setDescription(content).setColor(0x5865F2).setTimestamp().setFooter({ text: this.bot?.client?.user?.username || 'Bot' })] });
    }
    return new BetterEmbed(this);
  }

  /**
   * Reacts to the message with an emoji.
   * @param {string} emoji - The emoji to react with.
   * @returns {Promise<void>}
   */
  async react(emoji) {
    if (!this.raw.react) return;
    return this.raw.react(emoji);
  }

  /**
   * Sends a file to the channel.
   * @param {string} filePath - The path to the file.
   * @returns {Promise<Message>} The sent message.
   */
  async file(filePath) {
    return this.reply({ files: [filePath] });
  }

  /**
   * Defers the reply to the interaction.
   * @returns {Promise<void>}
   */
  async defer() {
    if (this.isInteraction) return this.raw.deferReply();
  }

  /**
   * Sends a follow-up message to the interaction.
   * @param {string|object} content - The content of the follow-up message.
   * @returns {Promise<Message>} The sent message.
   */
  async followUp(content) {
    if (this.isInteraction) return this.raw.followUp(content);
  }

  /**
   * Checks if the user has the specified permissions.
   * @param {Array<string>} perms - The permissions to check for.
   * @returns {boolean} Whether the user has the permissions.
   */
  hasPerms(perms) {
    if (!this.member || !this.member.permissions) return false;
    return this.member.permissions.has(perms);
  }

  /**
   * Sends a success message.
   * @param {string} msg - The success message.
   * @returns {Promise<Message>} The sent message.
   */
  success(msg) {
    return this.reply({ embeds: [new EmbedBuilder().setDescription('✅ ' + msg).setColor(0x57F287).setTimestamp().setFooter({ text: this.bot?.client?.user?.username || 'Bot' })] });
  }

  /**
   * Sends an error message.
   * @param {string} msg - The error message.
   * @returns {Promise<Message>} The sent message.
   */
  error(msg) {
    return this.reply({ embeds: [new EmbedBuilder().setDescription('❌ ' + msg).setColor(0xED4245).setTimestamp().setFooter({ text: this.bot?.client?.user?.username || 'Bot' })] });
  }

  /**
   * Sends an info message.
   * @param {string} msg - The info message.
   * @returns {Promise<Message>} The sent message.
   */
  info(msg) {
    return this.reply({ embeds: [new EmbedBuilder().setDescription('ℹ️ ' + msg).setColor(0x5865F2).setTimestamp().setFooter({ text: this.bot?.client?.user?.username || 'Bot' })] });
  }

  /**
   * Sends a warning message.
   * @param {string} msg - The warning message.
   * @returns {Promise<Message>} The sent message.
   */
  warn(msg) {
    return this.reply({ embeds: [new EmbedBuilder().setDescription('⚠️ ' + msg).setColor(0xFEE75C).setTimestamp().setFooter({ text: this.bot?.client?.user?.username || 'Bot' })] });
  }

  /**
   * Awaits a message from the user.
   * @param {Function} filter - The filter for the message.
   * @param {object} [options={}] - The options for the await.
   * @returns {Promise<Message|null>} The collected message or null.
   */
  async awaitMessage(filter, options = {}) {
    return await this.channel.awaitMessages({ filter, max: 1, time: options.time || 30000, errors: ['time'] })
      .then(col => col.first())
      .catch(() => null);
  }

  /**
   * Awaits a reaction from the user.
   * @param {Array<string>} [emojis] - The emojis to await.
   * @param {object} [options={}] - The options for the await.
   * @returns {Promise<MessageReaction|null>} The collected reaction or null.
   */
  async awaitReaction(emojis, options = {}) {
    const filter = (r, u) => u.id === this.user.id && (!emojis || emojis.includes(r.emoji.name));
    return await this.raw.awaitReactions({ filter, max: 1, time: options.time || 30000, errors: ['time'] })
      .then(col => col.first())
      .catch(() => null);
  }

  /**
   * Awaits a component interaction from the user.
   * @param {number} type - The type of the component.
   * @param {Function} filter - The filter for the interaction.
   * @param {number} [timeout=30000] - The timeout for the await.
   * @returns {Promise<Interaction|null>} The collected interaction or null.
   */
  async awaitComponent(type, filter, timeout = 30000) {
    const collector = this.raw.createMessageComponentCollector({ componentType: type, filter, time: timeout });
    return new Promise(resolve => {
      collector.on('collect', i => resolve(i));
      collector.on('end', () => resolve(null));
    });
  }

  /**
   * Paginates through an array of embeds.
   * @param {Array<EmbedBuilder>} pages - The pages to paginate.
   * @param {object} [options={}] - The options for the paginator.
   * @returns {Promise<Message>} The sent message.
   */
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

  /**
   * Creates a button.
   * @param {string} label - The label of the button.
   * @param {object} [options={}] - The options for the button.
   * @param {Function} [handler] - The handler for the button.
   * @returns {ButtonBuilder} The created button.
   */
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

  /**
   * Creates a select menu.
   * @param {Array<string>} options - The options for the menu.
   * @param {Function} [handler] - The handler for the menu.
   * @returns {ActionRowBuilder} The created menu.
   */
  menu(options, handler) {
    const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
    const menu = new StringSelectMenuBuilder()
      .setCustomId('menu_' + Date.now())
      .addOptions(options.map(opt => ({ label: opt, value: opt })));
    const row = new ActionRowBuilder().addComponents(menu);
    if (handler) menu.handler = handler;
    return row;
  }

  /**
   * Makes text bold.
   * @param {string} str - The text to make bold.
   * @returns {string} The bolded text.
   */
  bold(str) { return `**${str}**`; }

  /**
   * Makes text italic.
   * @param {string} str - The text to make italic.
   * @returns {string} The italicized text.
   */
  italic(str) { return `*${str}*`; }

  /**
   * Makes text a code block.
   * @param {string} str - The text to put in a code block.
   * @returns {string} The code block.
   */
  code(str) { return `\`${str}\``; }

  /**
   * Shows a modal to the user.
   * @param {Array<object>} fields - The fields for the modal.
   * @param {object} [options={}] - The options for the modal.
   * @returns {Promise<object|null>} The submitted data or null.
   */
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

  /**
   * Creates a multi-step dialog.
   * @param {Array<string>} steps - The steps of the dialog.
   * @param {object} [options={}] - The options for the dialog.
   * @returns {Promise<Array<string>>} The collected answers.
   */
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

  /**
   * Awaits button interactions.
   * @param {Message} msg - The message with the buttons.
   * @param {object} handlers - The handlers for the buttons.
   * @param {object} [options={}] - The options for the await.
   * @returns {Promise<Collector>} The collector.
   */
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

  /**
   * Deletes the invoking message or interaction.
   * @returns {Promise<void>}
   */
  async delete() {
    if (this.isInteraction && this.raw.deferred) {
      return this.raw.deleteReply();
    }
    if (this.raw.delete) {
      return this.raw.delete();
    }
    throw new Error('Cannot delete this context');
  }

  /**
   * Paginates through an array of embeds.
   * @param {Array<EmbedBuilder>} pages - The pages to paginate.
   * @param {object} [options={}] - The options for the paginator.
   * @returns {Promise<Message>} The sent message.
   */
  async paginator(pages, options = {}) {
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

  /**
   * Creates a row of buttons.
   * @param {Array<object>} buttons - The buttons to create.
   * @returns {ActionRowBuilder} The created button row.
   */
  buttonRow(buttons) {
    const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
    return new ActionRowBuilder().addComponents(
      buttons.map(b => new ButtonBuilder().setCustomId(b.customId).setLabel(b.label).setStyle(b.style || 2))
    );
  }

  /**
   * Waits for a message or reaction.
   * @param {string} type - The type of event to wait for.
   * @param {Function} filter - The filter for the event.
   * @param {number} [timeout=15000] - The timeout for the await.
   * @returns {Promise<Message|MessageReaction|null>} The collected event or null.
   */
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

  /**
   * Picks a random element from an array.
   * @param {Array} arr - The array to pick from.
   * @returns {*} A random element from the array.
   */
  randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Sends a direct message to a user.
   * @param {User|string} user - The user to DM.
   * @param {string|object} content - The content of the DM.
   * @returns {Promise<Message>} The sent message.
   */
  async dm(user, content) {
    let userObj = user;
    if (typeof user === 'string') {
      userObj = await this.fetchUser(user);
    }
    if (!userObj || !userObj.send) throw new Error('Invalid user');
    return await userObj.send(content);
  }

  /**
   * Fetches a user by their ID.
   * @param {string} id - The ID of the user to fetch.
   * @returns {Promise<User>} The fetched user.
   */
  async fetchUser(id) {
    return await this.bot.client.users.fetch(id);
  }

  /**
   * Fetches a member by their ID from the current guild.
   * @param {string} id - The ID of the member to fetch.
   * @returns {Promise<GuildMember>} The fetched member.
   */
  async fetchMember(id) {
    if (!this.guild) throw new Error('No guild context');
    return await this.guild.members.fetch(id);
  }

  /**
   * Sends a message with attachments
   * @param {Array<string|Buffer|AttachmentBuilder>} attachments - Files to attach
   * @param {string|object} content - Optional message content
   * @returns {Promise<Message>} The sent message
   */
  async sendFiles(attachments, content = null) {
    const files = attachments.map(att => {
      if (typeof att === 'string' || Buffer.isBuffer(att)) {
        return new AttachmentBuilder(att);
      }
      return att;
    });
    
    if (content) {
      return this.reply({ content, files });
    }
    return this.reply({ files });
  }

  /**
   * Creates a thread in the channel
   * @param {string} name - Thread name
   * @param {object} options - Thread options
   * @returns {Promise<ThreadChannel>} The created thread
   */
  async createThread(name, options = {}) {
    if (!this.channel?.threads) throw new Error('Channel does not support threads');
    return await this.channel.threads.create({
      name,
      autoArchiveDuration: options.autoArchiveDuration || 60,
      reason: options.reason,
      ...options
    });
  }

  /**
   * Pins the message
   * @returns {Promise<void>}
   */
  async pin() {
    if (!this.raw.pin) throw new Error('Cannot pin this message');
    return await this.raw.pin();
  }

  /**
   * Unpins the message
   * @returns {Promise<void>}
   */
  async unpin() {
    if (!this.raw.unpin) throw new Error('Cannot unpin this message');
    return await this.raw.unpin();
  }

  /**
   * Starts typing indicator
   * @returns {Promise<void>}
   */
  async typing() {
    return await this.channel.sendTyping();
  }

  /**
   * Gets the database instance
   * @returns {Database} The database instance
   */
  get db() {
    return this.bot.db;
  }

  /**
   * Component builder shorthand
   * @returns {ComponentBuilder}
   */
  get components() {
    return ComponentBuilder;
  }

  /**
   * Creates a new button using fluent API
   * @returns {BetterButton}
   */
  newButton() {
    return new BetterButton();
  }

  /**
   * Creates a new select menu using fluent API
   * @param {string} type - Menu type
   * @returns {BetterSelectMenu}
   */
  newMenu(type = 'string') {
    return new BetterSelectMenu(type);
  }

  /**
   * Creates a new action row using fluent API
   * @returns {BetterRow}
   */
  newRow() {
    return new BetterRow();
  }

  /**
   * Send ephemeral reply (slash commands only)
   * @param {string|object} content - Message content
   * @returns {Promise<Message>}
   */
  async ephemeral(content) {
    if (!this.isInteraction) {
      throw new Error('Ephemeral messages only work with interactions');
    }
    if (typeof content === 'string') {
      return this.reply({ content, ephemeral: true });
    }
    return this.reply({ ...content, ephemeral: true });
  }

  /**
   * Update the original interaction reply
   * @param {string|object} content - New content
   * @returns {Promise<Message>}
   */
  async update(content) {
    if (!this.isInteraction) throw new Error('Update only works with interactions');
    if (typeof content === 'string') {
      return this.raw.editReply({ content });
    }
    return this.raw.editReply(content);
  }

  /**
   * Fetch the original interaction reply
   * @returns {Promise<Message>}
   */
  async fetchReply() {
    if (!this.isInteraction) throw new Error('fetchReply only works with interactions');
    return await this.raw.fetchReply();
  }

  /**
   * Check if user has a specific role
   * @param {string|Role} role - Role ID or Role object
   * @returns {boolean}
   */
  hasRole(role) {
    if (!this.member) return false;
    const roleId = typeof role === 'string' ? role : role.id;
    return this.member.roles.cache.has(roleId);
  }

  /**
   * Add role to user
   * @param {string|Role} role - Role ID or Role object
   * @param {string} reason - Reason for audit log
   * @returns {Promise<GuildMember>}
   */
  async addRole(role, reason) {
    if (!this.member) throw new Error('No member in context');
    return await this.member.roles.add(role, reason);
  }

  /**
   * Remove role from user
   * @param {string|Role} role - Role ID or Role object
   * @param {string} reason - Reason for audit log
   * @returns {Promise<GuildMember>}
   */
  async removeRole(role, reason) {
    if (!this.member) throw new Error('No member in context');
    return await this.member.roles.remove(role, reason);
  }

  /**
   * Timeout a member
   * @param {number} duration - Duration in milliseconds
   * @param {string} reason - Reason for timeout
   * @returns {Promise<GuildMember>}
   */
  async timeout(duration, reason) {
    if (!this.member) throw new Error('No member in context');
    return await this.member.timeout(duration, reason);
  }

  /**
   * Kick a member
   * @param {GuildMember|string} member - Member to kick (or user ID)
   * @param {string} reason - Reason for kick
   * @returns {Promise<GuildMember>}
   */
  async kick(member, reason) {
    if (!this.guild) throw new Error('No guild context');
    const memberObj = typeof member === 'string' ? await this.guild.members.fetch(member) : member;
    return await memberObj.kick(reason);
  }

  /**
   * Ban a member
   * @param {GuildMember|string} member - Member to ban (or user ID)
   * @param {object} options - Ban options
   * @returns {Promise<GuildMember>}
   */
  async ban(member, options = {}) {
    if (!this.guild) throw new Error('No guild context');
    const userId = typeof member === 'string' ? member : member.id;
    return await this.guild.members.ban(userId, options);
  }

  /**
   * Unban a user
   * @param {string} userId - User ID to unban
   * @param {string} reason - Reason for unban
   * @returns {Promise<User>}
   */
  async unban(userId, reason) {
    if (!this.guild) throw new Error('No guild context');
    return await this.guild.members.unban(userId, reason);
  }

  /**
   * Create a webhook in the current channel
   * @param {string} name - Webhook name
   * @param {object} options - Webhook options
   * @returns {Promise<Webhook>}
   */
  async createWebhook(name, options = {}) {
    if (!this.channel?.createWebhook) throw new Error('Channel does not support webhooks');
    return await this.channel.createWebhook({ name, ...options });
  }

  /**
   * Send message via webhook
   * @param {Webhook} webhook - The webhook to send through
   * @param {string|object} content - Message content
   * @returns {Promise<Message>}
   */
  async webhookSend(webhook, content) {
    return await webhook.send(content);
  }

  /**
   * Bulk delete messages
   * @param {number} amount - Number of messages to delete (max 100)
   * @param {boolean} filterBots - Whether to filter bot messages
   * @returns {Promise<Collection>}
   */
  async bulkDelete(amount, filterBots = false) {
    if (!this.channel?.bulkDelete) throw new Error('Channel does not support bulk delete');
    if (amount > 100) amount = 100;
    
    if (filterBots) {
      const messages = await this.channel.messages.fetch({ limit: amount });
      const filtered = messages.filter(m => m.author.bot);
      return await this.channel.bulkDelete(filtered);
    }
    
    return await this.channel.bulkDelete(amount, true);
  }

  /**
   * Get message by ID from current channel
   * @param {string} messageId - Message ID
   * @returns {Promise<Message>}
   */
  async getMessage(messageId) {
    return await this.channel.messages.fetch(messageId);
  }

  /**
   * Edit a message by ID
   * @param {string} messageId - Message ID
   * @param {string|object} content - New content
   * @returns {Promise<Message>}
   */
  async editMessage(messageId, content) {
    const message = await this.getMessage(messageId);
    return await message.edit(content);
  }

  /**
   * Delete a message by ID
   * @param {string} messageId - Message ID
   * @returns {Promise<Message>}
   */
  async deleteMessage(messageId) {
    const message = await this.getMessage(messageId);
    return await message.delete();
  }

  /**
   * Create an invite for the current channel
   * @param {object} options - Invite options
   * @returns {Promise<Invite>}
   */
  async createInvite(options = {}) {
    if (!this.channel?.createInvite) throw new Error('Channel does not support invites');
    return await this.channel.createInvite(options);
  }

  /**
   * Get all invites for the guild
   * @returns {Promise<Collection>}
   */
  async getInvites() {
    if (!this.guild) throw new Error('No guild context');
    return await this.guild.invites.fetch();
  }

  /**
   * Set channel permissions for a role or member
   * @param {Role|GuildMember} target - Target role or member
   * @param {object} permissions - Permission overwrites
   * @param {string} reason - Reason for audit log
   * @returns {Promise<void>}
   */
  async setPermissions(target, permissions, reason) {
    if (!this.channel?.permissionOverwrites) throw new Error('Channel does not support permission overwrites');
    return await this.channel.permissionOverwrites.create(target, permissions, { reason });
  }

  /**
   * Get all members with a specific role
   * @param {string|Role} role - Role ID or Role object
   * @returns {Collection<string, GuildMember>}
   */
  getMembersWithRole(role) {
    if (!this.guild) throw new Error('No guild context');
    const roleId = typeof role === 'string' ? role : role.id;
    return this.guild.members.cache.filter(member => member.roles.cache.has(roleId));
  }

  /**
   * Create a new role
   * @param {object} options - Role options
   * @returns {Promise<Role>}
   */
  async createRole(options = {}) {
    if (!this.guild) throw new Error('No guild context');
    return await this.guild.roles.create(options);
  }

  /**
   * Delete a role
   * @param {string|Role} role - Role ID or Role object
   * @param {string} reason - Reason for deletion
   * @returns {Promise<Role>}
   */
  async deleteRole(role, reason) {
    if (!this.guild) throw new Error('No guild context');
    const roleObj = typeof role === 'string' ? await this.guild.roles.fetch(role) : role;
    return await roleObj.delete(reason);
  }

  /**
   * Modify channel settings
   * @param {object} options - Channel options
   * @param {string} reason - Reason for modification
   * @returns {Promise<Channel>}
   */
  async modifyChannel(options, reason) {
    return await this.channel.edit(options, reason);
  }

  /**
   * Clone the current channel
   * @param {object} options - Clone options
   * @returns {Promise<Channel>}
   */
  async cloneChannel(options = {}) {
    if (!this.channel?.clone) throw new Error('Channel cannot be cloned');
    return await this.channel.clone(options);
  }

  /**
   * Delete the current channel
   * @param {string} reason - Reason for deletion
   * @returns {Promise<Channel>}
   */
  async deleteChannel(reason) {
    return await this.channel.delete(reason);
  }

  /**
   * Get audit logs
   * @param {object} options - Audit log options
   * @returns {Promise<GuildAuditLogs>}
   */
  async getAuditLogs(options = {}) {
    if (!this.guild) throw new Error('No guild context');
    return await this.guild.fetchAuditLogs(options);
  }

  /**
   * Get guild bans
   * @returns {Promise<Collection>}
   */
  async getBans() {
    if (!this.guild) throw new Error('No guild context');
    return await this.guild.bans.fetch();
  }

  /**
   * Search for members
   * @param {string} query - Search query
   * @param {number} limit - Result limit
   * @returns {Promise<Collection>}
   */
  async searchMembers(query, limit = 10) {
    if (!this.guild) throw new Error('No guild context');
    return await this.guild.members.search({ query, limit });
  }

  /**
   * Get guild emojis
   * @returns {Collection}
   */
  getEmojis() {
    if (!this.guild) throw new Error('No guild context');
    return this.guild.emojis.cache;
  }

  /**
   * Create custom emoji
   * @param {string|Buffer} attachment - Emoji image
   * @param {string} name - Emoji name
   * @param {object} options - Additional options
   * @returns {Promise<Emoji>}
   */
  async createEmoji(attachment, name, options = {}) {
    if (!this.guild) throw new Error('No guild context');
    return await this.guild.emojis.create({ attachment, name, ...options });
  }

  /**
   * Delete custom emoji
   * @param {string|Emoji} emoji - Emoji ID or Emoji object
   * @param {string} reason - Reason for deletion
   * @returns {Promise<void>}
   */
  async deleteEmoji(emoji, reason) {
    if (!this.guild) throw new Error('No guild context');
    const emojiObj = typeof emoji === 'string' ? await this.guild.emojis.fetch(emoji) : emoji;
    return await emojiObj.delete(reason);
  }

  /**
   * Get guild stickers
   * @returns {Collection}
   */
  getStickers() {
    if (!this.guild) throw new Error('No guild context');
    return this.guild.stickers.cache;
  }

  /**
   * Crosspost message (announcement channels)
   * @returns {Promise<Message>}
   */
  async crosspost() {
    if (!this.raw.crosspost) throw new Error('Message cannot be crossposted');
    return await this.raw.crosspost();
  }

  /**
   * Add reaction collector
   * @param {object} options - Collector options
   * @returns {ReactionCollector}
   */
  createReactionCollector(options = {}) {
    if (!this.raw.createReactionCollector) throw new Error('Cannot create reaction collector');
    return this.raw.createReactionCollector(options);
  }

  /**
   * Add message collector
   * @param {object} options - Collector options
   * @returns {MessageCollector}
   */
  createMessageCollector(options = {}) {
    return this.channel.createMessageCollector(options);
  }

  /**
   * Get message reference (replied message)
   * @returns {Promise<Message|null>}
   */
  async getReference() {
    if (!this.raw.reference) return null;
    return await this.channel.messages.fetch(this.raw.reference.messageId);
  }

  /**
   * Check if message mentions the bot
   * @returns {boolean}
   */
  mentionsBot() {
    if (!this.raw.mentions) return false;
    return this.raw.mentions.has(this.client.user.id);
  }

  /**
   * Get all mentioned users
   * @returns {Collection<string, User>}
   */
  getMentions() {
    if (!this.raw.mentions) return new (require('discord.js').Collection)();
    return this.raw.mentions.users;
  }

  /**
   * Get all mentioned roles
   * @returns {Collection<string, Role>}
   */
  getMentionedRoles() {
    if (!this.raw.mentions) return new (require('discord.js').Collection)();
    return this.raw.mentions.roles;
  }

  /**
   * Get all mentioned channels
   * @returns {Collection<string, Channel>}
   */
  getMentionedChannels() {
    if (!this.raw.mentions) return new (require('discord.js').Collection)();
    return this.raw.mentions.channels;
  }
}

module.exports = Ctx;

