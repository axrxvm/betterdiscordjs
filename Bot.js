const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const loadCommands = require("./loaders/commands");
const loadEvents = require("./loaders/events");
const Ctx = require("./utils/ctx");
const logger = require("./utils/logger");
const db = require("./utils/db");

class Bot {
  /** Global hooks for command run/error */
  onCommandRun(fn) { this._onCommandRun = fn; }
  onCommandError(fn) { this._onCommandError = fn; }

  /** Event middleware */
  beforeEvent(fn) { this._beforeEvent = fn; }

  /** Hot reload for commands/events */
  async reloadCommands() {
    this.commands.clear();
    await loadCommands(this);
    logger.info('Commands hot-reloaded.');
  }
  async reloadEvents() {
    // Remove all listeners except internal
    this.client.removeAllListeners();
    await loadEvents(this);
    logger.info('Events hot-reloaded.');
  }

  /** Wildcard event listeners */
  onAny(fn) {
    this._wildcardListeners = this._wildcardListeners || [];
    this._wildcardListeners.push(fn);
  }
  /** Integrate scheduler and queue */
  every(interval, fn) {
    return require('./utils/scheduler').every(interval, fn);
  }
  cron(expr, fn) {
    return require('./utils/scheduler').cron(expr, fn);
  }
  getQueue(name = 'default') {
    this._queues = this._queues || {};
    if (!this._queues[name]) this._queues[name] = new (require('./utils/queue'))();
    return this._queues[name];
  }
  /** Command inhibitors: pluggable conditions */
  addInhibitor(fn) {
    this._inhibitors = this._inhibitors || [];
    this._inhibitors.push(fn);
  }

  /** Enable/disable commands per guild */
  setCommandEnabled(guildId, cmdName, enabled) {
    this._cmdConfig = this._cmdConfig || {};
    this._cmdConfig[guildId] = this._cmdConfig[guildId] || {};
    this._cmdConfig[guildId][cmdName] = enabled;
  }
  isCommandEnabled(guildId, cmdName) {
    return this._cmdConfig?.[guildId]?.[cmdName] !== false;
  }

  /** Register context menu command */
  contextMenu(name, type, handler, description = "No description") {
    this.commands.set(name, { name, type, run: handler, description, contextMenu: true });
  }

  /** Register command overloads */
  overload(name, patterns, handler, description = "No description") {
    this.commands.set(name, { name, patterns, run: handler, description, overload: true });
  }
  /** Register global event hook */
  onAllEvents(handler) {
    this._allEventHandler = handler;
  }

  /** Register error hook */
  onError(handler) {
    this._errorHandler = handler;
  }

  /** Register pre/post command hooks */
  beforeCommand(handler) {
    this._beforeCommand = handler;
  }
  afterCommand(handler) {
    this._afterCommand = handler;
  }
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

    /** Change the bot's prefix at runtime and persist it for a guild */
    this.setPrefix = async (guildId, newPrefix) => {
      await db.setPrefix(guildId, newPrefix);
      logger.info(`Prefix for guild ${guildId} changed to: ${newPrefix}`);
    };
  }

  /** Inline command, supports { slash: true } for slash command registration */
  command(name, handler, descriptionOrOptions = "No description") {
    let description = typeof descriptionOrOptions === "string" ? descriptionOrOptions : (descriptionOrOptions.description || "No description");
    let options = typeof descriptionOrOptions === "object" ? descriptionOrOptions : {};
    // Wrap handler for slash-only commands to provide default error handling
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

  /** Inline event, supports event groups and middleware */
  on(eventName, handler, once = false) {
    const wrapped = (...args) => {
      const ctx = new Ctx(args[0], this);
      // Event middleware
      if (this._beforeEvent) this._beforeEvent(eventName, ctx, ...args);
      // Event group logging
      const group = eventName.includes('/') ? eventName.split('/')[0] : null;
      if (group) logger.info(`[${group}] Event: ${eventName}`);
      // Wildcard listeners
      if (this._wildcardListeners) {
        for (const fn of this._wildcardListeners) fn(eventName, ctx, ...args);
      }
      return handler(ctx, ...args);
    };
    if (once) this.client.once(eventName, wrapped);
    else this.client.on(eventName, wrapped);
  }

  async start() {
    // Hot-reload safety: clear listeners if restarting
    this.client.removeAllListeners();

    await db.init();
    if (this.commandsDir) await loadCommands(this);
    if (this.eventsDir) await loadEvents(this);

    // Global event hook
    this.client.on('raw', (...args) => {
      if (this._allEventHandler) {
        const ctx = new Ctx(args[0], this);
        this._allEventHandler(ctx, ...args);
      }
    });

    this.client.once("ready", () => {
      logger.info(`✅ Logged in as ${this.client.user.tag}`);
      // Pretty dashboard
      logger.info(`Commands loaded: ${this.commands.size}`);
      logger.info(`Events loaded: ...`); // Could count events
    });

    // Slash command handler
    this.client.on("interactionCreate", async interaction => {
      if (!interaction.isCommand()) return;
      const cmd = this.commands.get(interaction.commandName);
      if (!cmd) return;
      const ctx = new Ctx(interaction, this);
      this._runCommand(cmd, ctx);
    });

    // Prefix command handler
    this.client.on("messageCreate", async msg => {
      if (msg.author.bot || !msg.guild) return;
      const prefix = await db.getPrefix(msg.guild.id);
      if (!msg.content.startsWith(prefix)) return;
      const args = msg.content.slice(prefix.length).trim().split(/\s+/);
      const cmdName = args.shift().toLowerCase();

      const cmd =
        this.commands.get(cmdName) ||
        this.commands.get(this.aliases.get(cmdName));
      if (!cmd) return;

      const ctx = new Ctx(msg, this, args);
      // Rate limit
      const rateLimit = require('./utils/rateLimit');
      if (!rateLimit.check(ctx.user.id, cmdName)) {
        return ctx.reply('⏳ You are being rate limited.');
      }
      // Command logging middleware
      require('./utils/stats').logCommand(cmdName, ctx.user.id);
      // Pre-command hook
      if (this._beforeCommand) await this._beforeCommand(cmd, ctx);
      await this._runCommand(cmd, ctx);
      // Post-command hook
      if (this._afterCommand) await this._afterCommand(cmd, ctx);
    });

    this.client.login(this.token);
  }

  async stop() {
    // Graceful shutdown
    await this.client.destroy();
    logger.info('Bot stopped gracefully.');
  }

  async _runCommand(cmd, ctx) {
    if (this._onCommandRun) {
      try { await this._onCommandRun(cmd, ctx); } catch (e) { /* ignore */ }
    }
    // Dynamic enable/disable per guild
    if (ctx.guild && !this.isCommandEnabled(ctx.guild.id, cmd.name)) {
      return ctx.reply("❌ This command is disabled in this server.");
    }

    // Command inhibitors
    if (this._inhibitors) {
      for (const inhibitor of this._inhibitors) {
        const result = await inhibitor(cmd, ctx);
        if (result === false) return;
        if (typeof result === "string") return ctx.reply(result);
      }
    }

    // Command overloads
    if (cmd.overload && cmd.patterns) {
      for (const pattern of cmd.patterns) {
        if (pattern.match(ctx.args)) {
          return await pattern.run(ctx, ctx.args);
        }
      }
      return ctx.reply("❌ No matching overload for arguments.");
    }
    // Per-command before middleware
    if (cmd.before) {
      try { await cmd.before(ctx); } catch (err) { /* ignore */ }
    }

    // Built-in inhibitors
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
    // Cooldown
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
      // Per-command after middleware
      if (cmd.after) {
        try { await cmd.after(ctx); } catch (err) { /* ignore */ }
      }
    } catch (err) {
      logger.error(`Error in command ${cmd.name}: ${err.stack}`);
      // Per-command error middleware
      if (cmd.onError) {
        try { await cmd.onError(err, ctx); } catch (e) { /* ignore */ }
      } else {
        ctx.reply("⚠️ Something went wrong.");
      }
      // Global command error hook
      if (this._onCommandError) {
        try { await this._onCommandError(err, cmd, ctx); } catch (e) { /* ignore */ }
      }
      // Error hook
      if (this._errorHandler) this._errorHandler(err, cmd, ctx);
      // Error reporting to channel
      const logChannelId = process.env.BOT_LOG_CHANNEL;
      if (logChannelId) {
        const logChannel = this.client.channels.cache.get(logChannelId);
        if (logChannel) logChannel.send(`Error in command ${cmd.name}: ${err.stack}`);
      }
    }
  }
}

module.exports = Bot;
