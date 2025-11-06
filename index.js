/**
 * @file The main entry point for the betterdiscordjs framework.
 * @author Aarav Mehta
 * @see {@link https://github.com/axrxvm/betterdiscordjs}
 */

const Bot = require("./Bot");
const time = require("./utils/time");
const colors = require("./utils/colors");
const logger = require("./utils/logger");

// Plugin exports
const BasePlugin = require("./plugins/BasePlugin");
const PluginManager = require("./plugins/PluginManager");

// Built-in plugins
const WelcomePlugin = require("./plugins/welcome");
const ModerationPlugin = require("./plugins/moderation");
const AutoModPlugin = require("./plugins/automod");

// Managers
const { CommandManager, EventManager, InteractionManager } = require("./utils/managers");

// Component builders
const { ComponentBuilder, BetterButton, BetterSelectMenu, BetterRow } = require("./utils/components");

// Context
const Ctx = require("./utils/ctx");

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
 * @property {object} managers - Modular managers (CommandManager, EventManager, InteractionManager).
 * @property {ComponentBuilder} ComponentBuilder - Component builder for buttons, menus, etc.
 * @property {Ctx} Ctx - Context class for command/event handling.
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
  },
  managers: {
    CommandManager,
    EventManager,
    InteractionManager
  },
  components: {
    ComponentBuilder,
    BetterButton,
    BetterSelectMenu,
    BetterRow
  },
  Ctx
};


