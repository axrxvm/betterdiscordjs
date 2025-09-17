const { EmbedBuilder } = require('discord.js');

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
}

module.exports = Ctx;


