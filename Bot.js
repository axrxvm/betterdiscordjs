const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const loadCommands = require("./loaders/commands");
const loadEvents = require("./loaders/events");
const Ctx = require("./utils/ctx");
const logger = require("./utils/logger");
const db = require("./utils/db");

/**
 * The main bot class, handles client initialization, command and event loading,
 * and other core functionalities.
 * @class
 */
class Bot {
  /**
   * Creates an instance of the Bot.
   * @param {string} token - The Discord bot token.
   * @param {object} [options={}] - The bot options.
   * @param {string} [options.commandsDir=null] - The directory for command files.
   * @param {string} [options.eventsDir=null] - The directory for event files.
   * @param {string} [options.devGuild=null] - The developer guild ID for testing.
   * @param {string} [options.clientId=null] - The bot's client ID.
   * @param {string} [options.prefix='!'] - The default command prefix.
   */
  constructor(token, options = {}) {
    this.token = token || process.env.DISCORD_TOKEN;
    if (!this.token) throw new Error("[better-djs] No token provided!");

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
      ],
      partials: [Partials.Message, Partials.Channel, Partials.Reaction]
    });

    this.commands = new Collection();
    this.aliases = new Collection();
    this.cooldowns = new Collection();

    this.commandsDir = options.commandsDir || null;
    this.eventsDir = options.eventsDir || null;
    this.devGuild = options.devGuild || null;
    this.clientId = options.clientId || process.env.CLIENT_ID || null;

    this.prefix = options.prefix || "!";

    /**
     * Sets the prefix for a specific guild.
     * @param {string} guildId - The ID of the guild.
     * @param {string} newPrefix - The new prefix to set.
     * @returns {Promise<void>}
     */
    this.setPrefix = async (guildId, newPrefix) => {
      await db.setGuildConfig(guildId, 'prefix', newPrefix);
      logger.info(`Prefix for guild ${guildId} changed to: ${newPrefix}`);
    };
  }

  /**
   * Sets a global hook for command execution.
   * @param {Function} fn - The function to run when a command is executed.
   */
  onCommandRun(fn) { this._onCommandRun = fn; }

  /**
   * Sets a global hook for command errors.
   * @param {Function} fn - The function to run when a command encounters an error.
   */
  onCommandError(fn) { this._onCommandError = fn; }

  /**
   * Sets a middleware function to run before any event.
   * @param {Function} fn - The middleware function.
   */
  beforeEvent(fn) { this._beforeEvent = fn; }

  /**
   * Hot reloads all commands.
   * @returns {Promise<void>}
   */
  async reloadCommands() {
    this.commands.clear();
    await loadCommands(this);
    logger.info('Commands hot-reloaded.');
  }

  /**
   * Hot reloads all events.
   * @returns {Promise<void>}
   */
  async reloadEvents() {
    this.client.removeAllListeners();
    await loadEvents(this);
    logger.info('Events hot-reloaded.');
  }

  /**
   * Adds a wildcard listener for all events.
   * @param {Function} fn - The listener function.
   */
  onAny(fn) {
    this._wildcardListeners = this._wildcardListeners || [];
    this._wildcardListeners.push(fn);
  }

  /**
   * Schedules a function to run at a specified interval.
   * @param {string} interval - The interval at which to run the function.
   * @param {Function} fn - The function to run.
   * @returns {object} The scheduled job.
   */
  every(interval, fn) {
    return require('./utils/scheduler').every(interval, fn);
  }

  /**
   * Schedules a function to run based on a cron expression.
   * @param {string} expr - The cron expression.
   * @param {Function} fn - The function to run.
   * @returns {object} The scheduled job.
   */
  cron(expr, fn) {
    return require('./utils/scheduler').cron(expr, fn);
  }

  /**
   * Gets a queue by name, creating it if it doesn't exist.
   * @param {string} [name='default'] - The name of the queue.
   * @returns {object} The queue instance.
   */
  getQueue(name = 'default') {
    this._queues = this._queues || {};
    if (!this._queues[name]) this._queues[name] = new (require('./utils/queue'))();
    return this._queues[name];
  }

  /**
   * Adds a command inhibitor.
   * @param {Function} fn - The inhibitor function.
   */
  addInhibitor(fn) {
    this._inhibitors = this._inhibitors || [];
    this._inhibitors.push(fn);
  }

  /**
   * Enables or disables a command for a specific guild.
   * @param {string} guildId - The ID of the guild.
   * @param {string} cmdName - The name of the command.
   * @param {boolean} enabled - Whether the command should be enabled.
   */
  setCommandEnabled(guildId, cmdName, enabled) {
    this._cmdConfig = this._cmdConfig || {};
    this._cmdConfig[guildId] = this._cmdConfig[guildId] || {};
    this._cmdConfig[guildId][cmdName] = enabled;
  }

  /**
   * Checks if a command is enabled for a specific guild.
   * @param {string} guildId - The ID of the guild.
   * @param {string} cmdName - The name of the command.
   * @returns {boolean} Whether the command is enabled.
   */
  isCommandEnabled(guildId, cmdName) {
    return this._cmdConfig?.[guildId]?.[cmdName] !== false;
  }

  /**
   * Registers a context menu command.
   * @param {string} name - The name of the command.
   * @param {number} type - The type of the context menu command.
   * @param {Function} handler - The command handler.
   * @param {string} [description='No description'] - The command description.
   */
  contextMenu(name, type, handler, description = "No description") {
    this.commands.set(name, { name, type, run: handler, description, contextMenu: true });
  }

  /**
   * Registers a command with overloads.
   * @param {string} name - The name of the command.
   * @param {Array<object>} patterns - The command overloads.
   * @param {Function} handler - The command handler.
   * @param {string} [description='No description'] - The command description.
   */
  overload(name, patterns, handler, description = "No description") {
    this.commands.set(name, { name, patterns, run: handler, description, overload: true });
  }

  /**
   * Registers a global event hook.
   * @param {Function} handler - The event handler.
   */
  onAllEvents(handler) {
    this._allEventHandler = handler;
  }

  /**
   * Registers a global error hook.
   * @param {Function} handler - The error handler.
   */
  onError(handler) {
    this._errorHandler = handler;
  }

  /**
   * Registers a hook to run before a command is executed.
   * @param {Function} handler - The pre-command hook.
   */
  beforeCommand(handler) {
    this._beforeCommand = handler;
  }

  /**
   * Registers a hook to run after a command is executed.
   * @param {Function} handler - The post-command hook.
   */
  afterCommand(handler) {
    this._afterCommand = handler;
  }

  /**
   * Registers an inline command.
   * @param {string} name - The name of the command.
   * @param {Function} handler - The command handler.
   * @param {string|object} [descriptionOrOptions='No description'] - The command description or options.
   */
  command(name, handler, descriptionOrOptions = "No description") {
    let description = typeof descriptionOrOptions === "string" ? descriptionOrOptions : (descriptionOrOptions.description || "No description");
    let options = typeof descriptionOrOptions === "object" ? descriptionOrOptions : {};
    let run = handler;
    if (options.slash) {
      run = async function(ctx, ...args) {
        if (!ctx.isInteraction) {
          return ctx.reply("❌ This command is only available as a slash command. Please use the / version.");
        }
        return handler(ctx, ...args);
      };
    }
    const cmd = { name, run, description, ...options };
    this.commands.set(name, cmd);
  }

  /**
   * Registers an inline event handler.
   * @param {string} eventName - The name of the event.
   * @param {Function} handler - The event handler.
   * @param {boolean} [once=false] - Whether the event should only be handled once.
   */
  on(eventName, handler, once = false) {
    const wrapped = (...args) => {
      const ctx = new Ctx(args[0], this);
      if (this._beforeEvent) this._beforeEvent(eventName, ctx, ...args);
      const group = eventName.includes('/') ? eventName.split('/')[0] : null;
      if (group) logger.info(`[${group}] Event: ${eventName}`);
      if (this._wildcardListeners) {
        for (const fn of this._wildcardListeners) fn(eventName, ctx, ...args);
      }
      return handler(ctx, ...args);
    };
    if (once) this.client.once(eventName, wrapped);
    else this.client.on(eventName, wrapped);
  }

  /**
   * Starts the bot.
   * @returns {Promise<void>}
   */
  async start() {
    this.client.removeAllListeners();

    await db.init();
    if (this.commandsDir) await loadCommands(this);
    if (this.eventsDir) await loadEvents(this);

    this.client.on('raw', (...args) => {
      if (this._allEventHandler) {
        const ctx = new Ctx(args[0], this);
        this._allEventHandler(ctx, ...args);
      }
    });

    this.client.once("ready", () => {
      logger.info(`✅ Logged in as ${this.client.user.tag}`);
      logger.info(`Commands loaded: ${this.commands.size}`);
      logger.info(`Events loaded: ...`);
    });

    this.client.on("interactionCreate", async interaction => {
      if (!interaction.isCommand()) return;
      const cmd = this.commands.get(interaction.commandName);
      if (!cmd) return;
      const ctx = new Ctx(interaction, this);
      this._runCommand(cmd, ctx);
    });

    this.client.on("messageCreate", async msg => {
      if (msg.author.bot || !msg.guild) return;
      const prefix = await db.getGuildConfig(msg.guild.id, 'prefix', this.prefix);
      if (!msg.content.startsWith(prefix)) return;
      const args = msg.content.slice(prefix.length).trim().split(/\s+/);
      const cmdName = args.shift().toLowerCase();

      const cmd =
        this.commands.get(cmdName) ||
        this.commands.get(this.aliases.get(cmdName));
      if (!cmd) return;

      const ctx = new Ctx(msg, this, args);
      const rateLimit = require('./utils/rateLimit');
      if (!rateLimit.check(ctx.user.id, cmdName)) {
        return ctx.reply('⏳ You are being rate limited.');
      }
      require('./utils/stats').logCommand(cmdName, ctx.user.id);
      if (this._beforeCommand) await this._beforeCommand(cmd, ctx);
      await this._runCommand(cmd, ctx);
      if (this._afterCommand) await this._afterCommand(cmd, ctx);
    });

    this.client.login(this.token);
  }

  /**
   * Stops the bot gracefully.
   * @returns {Promise<void>}
   */
  async stop() {
    await this.client.destroy();
    logger.info('Bot stopped gracefully.');
  }

  /**
   * Executes a command.
   * @param {object} cmd - The command to execute.
   * @param {Ctx} ctx - The context of the command.
   * @returns {Promise<void>}
   * @private
   */
  async _runCommand(cmd, ctx) {
    if (this._onCommandRun) {
      try { await this._onCommandRun(cmd, ctx); } catch (e) { /* ignore */ }
    }
    if (ctx.guild && !this.isCommandEnabled(ctx.guild.id, cmd.name)) {
      return ctx.reply("❌ This command is disabled in this server.");
    }

    if (this._inhibitors) {
      for (const inhibitor of this._inhibitors) {
        const result = await inhibitor(cmd, ctx);
        if (result === false) return;
        if (typeof result === "string") return ctx.reply(result);
      }
    }

    if (cmd.overload && cmd.patterns) {
      for (const pattern of cmd.patterns) {
        if (pattern.match(ctx.args)) {
          return await pattern.run(ctx, ctx.args);
        }
      }
      return ctx.reply("❌ No matching overload for arguments.");
    }
    if (cmd.before) {
      try { await cmd.before(ctx); } catch (err) { /* ignore */ }
    }

    if (cmd.guildOnly && ctx.isDM) {
      return ctx.reply("❌ This command can only be used in servers.");
    }
    if (cmd.nsfwOnly && !ctx.channel.nsfw) {
      return ctx.reply("❌ This command can only be used in NSFW channels.");
    }
    if (cmd.devOnly && ctx.user.id !== process.env.BOT_OWNER_ID) {
      return ctx.reply("❌ This command is only for bot developers.");
    }
    if (cmd.permissions && !ctx.hasPerms(cmd.permissions)) {
      return ctx.reply("❌ You don’t have permission to use this.");
    }
    const cooldown = cmd.cooldown;
    if (cooldown) {
      const now = Date.now();
      const timestamps = this.cooldowns.get(cmd.name) || new Map();
      const cooldownMs = require("./utils/time").parse(cooldown);
      const expire = timestamps.get(ctx.user.id) || 0;
      if (now < expire) {
        const left = Math.ceil((expire - now) / 1000);
        return ctx.reply(`⏳ Please wait ${left}s before using \`${cmd.name}\` again.`);
      }
      timestamps.set(ctx.user.id, now + cooldownMs);
      this.cooldowns.set(cmd.name, timestamps);
    }

    try {
      await cmd.run(ctx);
      if (cmd.after) {
        try { await cmd.after(ctx); } catch (err) { /* ignore */ }
      }
    } catch (err) {
      logger.error(`Error in command ${cmd.name}: ${err.stack}`);
      if (cmd.onError) {
        try { await cmd.onError(err, ctx); } catch (e) { /* ignore */ }
      } else {
        ctx.reply("⚠️ Something went wrong.");
      }
      if (this._onCommandError) {
        try { await this._onCommandError(err, cmd, ctx); } catch (e) { /* ignore */ }
      }
      if (this._errorHandler) this._errorHandler(err, cmd, ctx);
      const logChannelId = process.env.BOT_LOG_CHANNEL;
      if (logChannelId) {
        const logChannel = this.client.channels.cache.get(logChannelId);
        if (logChannel) logChannel.send(`Error in command ${cmd.name}: ${err.stack}`);
      }
    }
  }
}

module.exports = Bot;
