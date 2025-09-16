/**
 * Base Plugin Class - All plugins should extend this class
 */
class BasePlugin {
  constructor(bot, pluginManager) {
    this.bot = bot;
    this.pluginManager = pluginManager;
    this.commands = new Map();
    this.events = new Map();
    this.intervals = new Set();
    this.hooks = new Map();
    
    // Plugin metadata (should be overridden)
    this.name = "BasePlugin";
    this.version = "1.0.0";
    this.description = "Base plugin class";
    this.author = "Unknown";
    this.dependencies = [];
  }

  /**
   * Called when the plugin is loaded
   */
  async onLoad() {
    // Override in child classes
  }

  /**
   * Called when the plugin is unloaded
   */
  async onUnload() {
    // Cleanup commands
    for (const [name] of this.commands) {
      this.bot.commands.delete(name);
    }
    
    // Cleanup events
    for (const [event, handler] of this.events) {
      this.bot.client.removeListener(event, handler);
    }
    
    // Cleanup intervals
    for (const interval of this.intervals) {
      clearInterval(interval);
    }
    
    // Cleanup hooks
    this.hooks.clear();
    
    this.commands.clear();
    this.events.clear();
    this.intervals.clear();
  }

  /**
   * Register a command with the plugin
   */
  addCommand(name, handler, options = {}) {
    const command = {
      name,
      run: handler,
      description: options.description || "No description",
      plugin: this.name,
      ...options
    };
    
    this.commands.set(name, command);
    this.bot.commands.set(name, command);
    
    // Register aliases
    if (options.aliases) {
      for (const alias of options.aliases) {
        this.bot.aliases.set(alias, name);
      }
    }
    
    return command;
  }

  /**
   * Register an event listener with the plugin
   */
  addEvent(eventName, handler, once = false) {
    const wrappedHandler = (...args) => {
      try {
        return handler(...args);
      } catch (error) {
        this.log(`Error in event ${eventName}: ${error.message}`, 'error');
      }
    };
    
    this.events.set(eventName, wrappedHandler);
    
    if (once) {
      this.bot.client.once(eventName, wrappedHandler);
    } else {
      this.bot.client.on(eventName, wrappedHandler);
    }
    
    return wrappedHandler;
  }

  /**
   * Add a scheduled task
   */
  addInterval(callback, ms) {
    const interval = setInterval(() => {
      try {
        callback();
      } catch (error) {
        this.log(`Error in interval: ${error.message}`, 'error');
      }
    }, ms);
    
    this.intervals.add(interval);
    return interval;
  }

  /**
   * Add a cron job
   */
  addCron(expression, callback) {
    return this.bot.cron(expression, () => {
      try {
        callback();
      } catch (error) {
        this.log(`Error in cron job: ${error.message}`, 'error');
      }
    });
  }

  /**
   * Register a hook for other plugins to use
   */
  addHook(name, handler) {
    this.hooks.set(name, handler);
    return handler;
  }

  /**
   * Call a hook from another plugin
   */
  async callHook(pluginName, hookName, ...args) {
    const plugin = this.pluginManager.getPlugin(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found`);
    }
    
    const hook = plugin.hooks.get(hookName);
    if (!hook) {
      throw new Error(`Hook ${hookName} not found in plugin ${pluginName}`);
    }
    
    return await hook(...args);
  }

  /**
   * Get plugin configuration
   */
  getConfig(key, defaultValue = null) {
    const config = this.pluginManager.pluginConfigs.get(this.name) || {};
    return config[key] !== undefined ? config[key] : defaultValue;
  }

  /**
   * Set plugin configuration
   */
  setConfig(key, value) {
    const config = this.pluginManager.pluginConfigs.get(this.name) || {};
    config[key] = value;
    this.pluginManager.pluginConfigs.set(this.name, config);
    this.pluginManager.saveConfig();
  }

  /**
   * Plugin-specific logging
   */
  log(message, level = 'info') {
    const logger = require('../utils/logger');
    logger[level](`[${this.name}] ${message}`);
  }

  /**
   * Get database instance scoped to this plugin
   */
  getDB() {
    const db = require('../utils/db');
    return {
      get: (key) => db.get(`plugins.${this.name}.${key}`),
      set: (key, value) => db.set(`plugins.${this.name}.${key}`, value),
      delete: (key) => db.delete(`plugins.${this.name}.${key}`),
      has: (key) => db.has(`plugins.${this.name}.${key}`)
    };
  }

  /**
   * Send a message to a channel
   */
  async sendMessage(channelId, content, options = {}) {
    const channel = this.bot.client.channels.cache.get(channelId);
    if (!channel) {
      throw new Error(`Channel ${channelId} not found`);
    }
    
    return await channel.send(content, options);
  }

  /**
   * Get guild configuration
   */
  async getGuildConfig(guildId, key, defaultValue = null) {
    const db = require('../utils/db');
    return await db.getGuildConfig(guildId, `plugins.${this.name}.${key}`, defaultValue);
  }

  /**
   * Set guild configuration
   */
  async setGuildConfig(guildId, key, value) {
    const db = require('../utils/db');
    return await db.setGuildConfig(guildId, `plugins.${this.name}.${key}`, value);
  }
}

module.exports = BasePlugin;