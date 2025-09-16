const fs = require("fs");
const path = require("path");
const { REST, Routes, SlashCommandBuilder } = require("discord.js");
const logger = require("../utils/logger");

/**
 * Loads all command files from the specified directory, registers them with the bot,
 * and syncs slash commands with Discord.
 * @param {Bot} bot - The bot instance.
 * @returns {Promise<void>}
 */
async function loadCommands(bot) {
  const commands = [];
  const commandsPath = path.resolve(process.cwd(), bot.commandsDir);

  /**
   * Recursively walks through a directory and loads all command files.
   * @param {string} dir - The directory to walk through.
   */
  function walk(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(file => {
      const filePath = path.join(dir, file.name);
      if (file.isDirectory()) return walk(filePath);
      if (!file.name.endsWith(".js")) return;

      const cmd = require(filePath);
      if (!cmd.name || !cmd.run) {
        logger.warn(`Skipped invalid command: ${file.name}`);
        return;
      }

      bot.commands.set(cmd.name, cmd);
      if (cmd.aliases) {
        for (const alias of cmd.aliases) bot.aliases.set(alias, cmd.name);
      }

      if (cmd.slash) {
        const slash = new SlashCommandBuilder()
          .setName(cmd.name)
          .setDescription(cmd.description || "No description");

        if (cmd.args) {
          for (const arg of cmd.args) {
            if (arg.type === "string") slash.addStringOption(o => o.setName(arg.name).setDescription(arg.name).setRequired(true));
            if (arg.type === "user") slash.addUserOption(o => o.setName(arg.name).setDescription(arg.name).setRequired(true));
            if (arg.type === "number") slash.addNumberOption(o => o.setName(arg.name).setDescription(arg.name).setRequired(true));
          }
        }

        commands.push(slash.toJSON());
        logger.info(`Loaded slash command: ${cmd.name}`);
      } else {
        logger.info(`Loaded message command: ${cmd.name}`);
      }
    });
  }

  walk(commandsPath);

  bot.client.once("ready", async () => {
    const rest = new REST({ version: "10" }).setToken(bot.token);
    try {
      if (bot.devGuild) {
        await rest.put(
          Routes.applicationGuildCommands(bot.client.user.id, bot.devGuild),
          { body: commands }
        );
        logger.info("Synced slash commands (dev guild)");
      } else {
        await rest.put(
          Routes.applicationCommands(bot.client.user.id),
          { body: commands }
        );
        logger.info("Synced slash commands (global)");
      }
    } catch (err) {
      logger.error(`Failed to sync slash commands: ${err}`);
    }
  });
}

module.exports = loadCommands;
