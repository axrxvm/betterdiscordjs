/**
 * @file The main entry point for the better-djs framework.
 * @author Your Name
 * @see {@link https://github.com/your-username/better-djs}
 */

const Bot = require("./Bot");
const time = require("./utils/time");
const colors =require("./utils/colors");
const logger = require("./utils/logger");

/**
 * The main export of the better-djs framework.
 * @module better-djs
 * @property {Bot} Bot - The main Bot class.
 * @property {object} time - Time and duration utilities.
 * @property {object} colors - Color definitions for logging.
 * @property {object} logger - The logging utility.
 */
module.exports = { Bot, time, colors, logger };
