/**
 * Managers module - Modular bot management system
 * @module managers
 */

const CommandManager = require('./CommandManager');
const EventManager = require('./EventManager');
const InteractionManager = require('./InteractionManager');

module.exports = {
  CommandManager,
  EventManager,
  InteractionManager,
};
