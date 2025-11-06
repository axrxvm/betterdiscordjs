const { Collection } = require('discord.js');
const logger = require('../logger');

/**
 * Manages events for the bot
 * @class EventManager
 */
class EventManager {
  constructor(bot) {
    this.bot = bot;
    this.events = new Collection();
    this.wildcardListeners = [];
    this.eventGroups = {};
    
    // Middleware
    this.beforeEvent = null;
    this.allEventHandler = null;
  }

  /**
   * Register an event
   * @param {string} eventName - Event name
   * @param {Function} handler - Event handler
   * @param {object} options - Event options
   */
  register(eventName, handler, options = {}) {
    const event = {
      name: eventName,
      run: handler,
      once: options.once || false,
      group: options.group || null,
      ...options
    };

    // Store event
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName).push(event);

    // Register with Discord client
    const wrappedHandler = this._wrapHandler(event);
    if (event.once) {
      this.bot.client.once(eventName, wrappedHandler);
    } else {
      this.bot.client.on(eventName, wrappedHandler);
    }

    logger.debug(`Registered event: ${eventName}${event.once ? ' (once)' : ''}`);
    return event;
  }

  /**
   * Wrap event handler with middleware and error handling
   * @param {object} event - Event object
   * @returns {Function} Wrapped handler
   * @private
   */
  _wrapHandler(event) {
    return async (...args) => {
      try {
        // Before event middleware
        if (this.beforeEvent) {
          await this.beforeEvent(event.name, ...args);
        }

        // Event group logging
        if (event.group) {
          logger.debug(`[${event.group}] Event: ${event.name}`);
        }

        // Execute event handler
        await event.run(this.bot, ...args);

        // All event handler
        if (this.allEventHandler) {
          await this.allEventHandler(event.name, ...args);
        }

        // Wildcard listeners
        for (const listener of this.wildcardListeners) {
          await listener(event.name, ...args);
        }
      } catch (error) {
        logger.error(`Error in event ${event.name}: ${error.message}`);
        if (this.bot._errorHandler) {
          this.bot._errorHandler(error);
        }
      }
    };
  }

  /**
   * Unregister an event
   * @param {string} eventName - Event name
   * @param {Function} handler - Specific handler to remove (optional)
   */
  unregister(eventName, handler = null) {
    if (!this.events.has(eventName)) return false;

    if (handler) {
      const events = this.events.get(eventName);
      const index = events.findIndex(e => e.run === handler);
      if (index !== -1) {
        events.splice(index, 1);
        this.bot.client.off(eventName, handler);
      }
    } else {
      this.bot.client.removeAllListeners(eventName);
      this.events.delete(eventName);
    }

    logger.debug(`Unregistered event: ${eventName}`);
    return true;
  }

  /**
   * Add a wildcard listener (listens to all events)
   * @param {Function} fn - Listener function
   */
  addWildcardListener(fn) {
    this.wildcardListeners.push(fn);
  }

  /**
   * Remove a wildcard listener
   * @param {Function} fn - Listener function
   */
  removeWildcardListener(fn) {
    const index = this.wildcardListeners.indexOf(fn);
    if (index !== -1) {
      this.wildcardListeners.splice(index, 1);
    }
  }

  /**
   * Get all events
   * @returns {Collection}
   */
  all() {
    return this.events;
  }

  /**
   * Get events by group
   * @param {string} group - Group name
   * @returns {Array}
   */
  getByGroup(group) {
    const result = [];
    this.events.forEach(events => {
      events.forEach(event => {
        if (event.group === group) result.push(event);
      });
    });
    return result;
  }

  /**
   * Clear all events
   */
  clear() {
    this.bot.client.removeAllListeners();
    this.events.clear();
    this.wildcardListeners = [];
  }

  /**
   * Reload all events
   */
  async reload() {
    this.clear();
    if (this.bot.eventsDir) {
      await require('../../loaders/events')(this.bot);
    }
  }

  /**
   * Emit a custom event
   * @param {string} eventName - Event name
   * @param  {...any} args - Event arguments
   */
  emit(eventName, ...args) {
    this.bot.client.emit(eventName, ...args);
  }

  /**
   * Wait for an event
   * @param {string} eventName - Event name
   * @param {Function} filter - Filter function
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise}
   */
  waitFor(eventName, filter, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.bot.client.off(eventName, handler);
        reject(new Error('Event wait timeout'));
      }, timeout);

      const handler = (...args) => {
        if (filter(...args)) {
          clearTimeout(timer);
          this.bot.client.off(eventName, handler);
          resolve(args);
        }
      };

      this.bot.client.on(eventName, handler);
    });
  }
}

module.exports = EventManager;
