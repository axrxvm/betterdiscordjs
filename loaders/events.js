const fs = require("fs");
const path = require("path");
const Ctx = require("../utils/ctx");
const logger = require("../utils/logger");

async function loadEvents(bot) {
  const eventsPath = path.resolve(process.cwd(), bot.eventsDir);

  fs.readdirSync(eventsPath).forEach(file => {
    if (!file.endsWith(".js")) return;

    const eventName = file.replace(".js", "");
    const once = eventName.startsWith("once_");
    const cleanName = once ? eventName.replace("once_", "") : eventName;

    const handler = require(path.join(eventsPath, file));

    const wrapped = (...args) => {
      const ctx = new Ctx(args[0], bot);
      return handler(ctx, ...args, bot);
    };

    if (once) bot.client.once(cleanName, wrapped);
    else bot.client.on(cleanName, wrapped);

    logger.info(`Loaded event: ${cleanName}`);
  });
}

module.exports = loadEvents;
