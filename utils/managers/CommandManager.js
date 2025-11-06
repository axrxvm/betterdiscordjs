const { Collection } = require('discord.js');
const logger = require('../logger');

/**
 * Manages commands for the bot
 * @class CommandManager
 */
class CommandManager {
  constructor(bot) {
    this.bot = bot;
    this.commands = new Collection();
    this.aliases = new Collection();
    this.cooldowns = new Collection();
    this.inhibitors = [];
    this.commandConfig = {};
    
    // Hooks
    this.beforeCommand = null;
    this.afterCommand = null;
    this.onCommandRun = null;
    this.onCommandError = null;
  }

  /**
   * Register a command
   * @param {string} name - Command name
   * @param {Function|object} handler - Command handler or command object
   * @param {object} options - Command options
   */
  register(name, handler, options = {}) {
    const command = typeof handler === 'function'
      ? { name, run: handler, ...options }
      : { name, ...handler, ...options };

    // Store command
    this.commands.set(name, command);

    // Register aliases
    if (command.aliases) {
      command.aliases.forEach(alias => {
        this.aliases.set(alias, name);
      });
    }

    logger.debug(`Registered command: ${name}`);
    return command;
  }

  /**
   * Unregister a command
   * @param {string} name - Command name
   */
  unregister(name) {
    const command = this.commands.get(name);
    if (!command) return false;

    // Remove aliases
    if (command.aliases) {
      command.aliases.forEach(alias => this.aliases.delete(alias));
    }

    this.commands.delete(name);
    logger.debug(`Unregistered command: ${name}`);
    return true;
  }

  /**
   * Get a command by name or alias
   * @param {string} name - Command name or alias
   * @returns {object|null} The command object
   */
  get(name) {
    return this.commands.get(name) || this.commands.get(this.aliases.get(name));
  }

  /**
   * Check if a command exists
   * @param {string} name - Command name or alias
   * @returns {boolean}
   */
  has(name) {
    return this.commands.has(name) || this.aliases.has(name);
  }

  /**
   * Add a command inhibitor (condition that prevents command execution)
   * @param {Function} fn - Inhibitor function
   */
  addInhibitor(fn) {
    this.inhibitors.push(fn);
  }

  /**
   * Check if a command should be inhibited
   * @param {object} ctx - Context object
   * @param {object} command - Command object
   * @returns {Promise<boolean>}
   */
  async checkInhibitors(ctx, command) {
    for (const inhibitor of this.inhibitors) {
      const result = await inhibitor(ctx, command);
      if (result === false) return true; // Inhibited
    }
    return false; // Not inhibited
  }

  /**
   * Check cooldown for a command
   * @param {string} userId - User ID
   * @param {string} commandName - Command name
   * @param {number} cooldownTime - Cooldown duration in seconds
   * @returns {number|null} Remaining cooldown time or null
   */
  checkCooldown(userId, commandName, cooldownTime) {
    if (!this.cooldowns.has(commandName)) {
      this.cooldowns.set(commandName, new Collection());
    }

    const now = Date.now();
    const timestamps = this.cooldowns.get(commandName);
    const cooldownAmount = (cooldownTime || 0) * 1000;

    if (timestamps.has(userId)) {
      const expirationTime = timestamps.get(userId) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return timeLeft;
      }
    }

    timestamps.set(userId, now);
    setTimeout(() => timestamps.delete(userId), cooldownAmount);
    return null;
  }

  /**
   * Set command enabled/disabled state for a guild
   * @param {string} guildId - Guild ID
   * @param {string} commandName - Command name
   * @param {boolean} enabled - Enabled state
   */
  setEnabled(guildId, commandName, enabled) {
    if (!this.commandConfig[guildId]) {
      this.commandConfig[guildId] = {};
    }
    this.commandConfig[guildId][commandName] = enabled;
  }

  /**
   * Check if a command is enabled in a guild
   * @param {string} guildId - Guild ID
   * @param {string} commandName - Command name
   * @returns {boolean}
   */
  isEnabled(guildId, commandName) {
    return this.commandConfig?.[guildId]?.[commandName] !== false;
  }

  /**
   * Get all commands
   * @returns {Collection}
   */
  all() {
    return this.commands;
  }

  /**
   * Get commands by category
   * @param {string} category - Category name
   * @returns {Collection}
   */
  getByCategory(category) {
    return this.commands.filter(cmd => cmd.category === category);
  }

  /**
   * Get all categories
   * @returns {Array<string>}
   */
  getCategories() {
    const categories = new Set();
    this.commands.forEach(cmd => {
      if (cmd.category) categories.add(cmd.category);
    });
    return Array.from(categories);
  }

  /**
   * Clear all commands
   */
  clear() {
    this.commands.clear();
    this.aliases.clear();
    this.cooldowns.clear();
  }

  /**
   * Reload all commands
   */
  async reload() {
    this.clear();
    if (this.bot.commandsDir) {
      await require('../../loaders/commands')(this.bot);
    }
  }

  /**
   * Execute a command
   * @param {object} ctx - Context object
   * @param {string} commandName - Command name
   * @param {Array} args - Command arguments
   */
  async execute(ctx, commandName, args) {
    const command = this.get(commandName);
    if (!command) return null;

    try {
      // Check if command is enabled for this guild
      if (ctx.guild && !this.isEnabled(ctx.guild.id, command.name)) {
        return await ctx.error('This command is disabled in this server.');
      }

      // Check inhibitors
      if (await this.checkInhibitors(ctx, command)) {
        return null;
      }

      // Check cooldown
      if (command.cooldown) {
        const cooldownLeft = this.checkCooldown(ctx.user.id, command.name, command.cooldown);
        if (cooldownLeft) {
          return await ctx.reply(`⏰ Please wait ${cooldownLeft.toFixed(1)}s before using this command again.`);
        }
      }

      // Check permissions
      if (command.permissions && !ctx.hasPerms(command.permissions)) {
        return await ctx.error('You don\'t have permission to use this command.');
      }

      // Before command hook
      if (this.beforeCommand) {
        await this.beforeCommand(ctx, command);
      }

      // Execute command
      const result = await command.run(ctx, ...args);

      // After command hook
      if (this.afterCommand) {
        await this.afterCommand(ctx, command);
      }

      // On command run hook
      if (this.onCommandRun) {
        this.onCommandRun(ctx, command);
      }

      return result;
    } catch (error) {
      logger.error(`Error executing command ${command.name}: ${error.message}`);
      
      // On command error hook
      if (this.onCommandError) {
        this.onCommandError(ctx, command, error);
      } else {
        await ctx.error(`An error occurred: ${error.message}`);
      }
    }
  }
}

module.exports = CommandManager;
