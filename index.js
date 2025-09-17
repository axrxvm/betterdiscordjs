/**
 * @file The main entry point for the betterdiscordjs framework.
 * @author Your Name
 * @see {@link https://github.com/axrxvm/betterdiscordjs}
 */

const Bot = require("./Bot");
const time = require("./utils/time");
const colors =require("./utils/colors");
const logger = require("./utils/logger");

// Plugin exports
const BasePlugin = require("./plugins/BasePlugin");
const PluginManager = require("./plugins/PluginManager");

// Built-in plugins
const WelcomePlugin = require("./plugins/welcome");
const ModerationPlugin = require("./plugins/moderation");
const AutoModPlugin = require("./plugins/automod");

/**
 * The main export of the betterdiscordjs framework.
 * @module betterdiscordjs
 * @property {Bot} Bot - The main Bot class.
 * @property {object} time - Time and duration utilities.
 * @property {object} colors - Color definitions for logging.
 * @property {object} logger - The logging utility.
 * @property {BasePlugin} BasePlugin - Base class for creating plugins.
 * @property {PluginManager} PluginManager - Plugin management system.
 * @property {object} plugins - Built-in plugins.
 */
module.exports = { 
  Bot, 
  time, 
  colors, 
  logger,
  BasePlugin,
  PluginManager,
  plugins: {
    WelcomePlugin,
    ModerationPlugin,
    AutoModPlugin
  }
};


