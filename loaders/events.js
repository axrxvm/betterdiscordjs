const fs = require("fs");
const path = require("path");
const Ctx = require("../utils/ctx");
const logger = require("../utils/logger");

/**
 * Loads all event files from the specified directory and registers them with the bot's client.
 * @param {Bot} bot - The bot instance.
 * @returns {Promise<void>}
 */
async function loadEvents(bot) {
  const eventsPath = path.resolve(process.cwd(), bot.eventsDir);

  fs.readdirSync(eventsPath).forEach(file => {
    if (!file.endsWith(".js")) return;

    const eventName = file.replace(".js", "");
    const once = eventName.startsWith("once_");
    const cleanName = once ? eventName.replace("once_", "") : eventName;

    const handler = require(path.join(eventsPath, file));

    const wrapped = (...args) => {
      // For events like 'ready' that don't have a message/interaction, pass null
      const firstArg = args[0];
      const ctx = firstArg && (firstArg.author || firstArg.user || firstArg.isCommand) 
        ? new Ctx(firstArg, bot) 
        : { bot, client: bot.client };
      return handler(ctx, ...args, bot);
    };

    if (once) bot.client.once(cleanName, wrapped);
    else bot.client.on(cleanName, wrapped);

    logger.info(`Loaded event: ${cleanName}`);
  });
}

module.exports = loadEvents;




