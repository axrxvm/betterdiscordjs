const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

const file = path.resolve(__dirname, '../data/botdata.json');
const adapter = new JSONFile(file);

/**
 * The LowDB instance for the bot.
 * @type {Low}
 */
const db = new Low(adapter, { guilds: {} });

/**
 * Initializes the database, creating the data file if it doesn't exist.
 * @returns {Promise<void>}
 */
async function init() {
  await db.read();
  db.data ||= { guilds: {} };
  await db.write();
}

/**
 * Gets a configuration value for a guild.
 * @param {string} guildId - The ID of the guild.
 * @param {string} key - The configuration key.
 * @param {*} [def] - The default value to return if the key is not found.
 * @returns {Promise<*>} The configuration value.
 */
async function getGuildConfig(guildId, key, def) {
  await db.read();
  return db.data.guilds[guildId]?.[key] ?? def;
}

/**
 * Sets a configuration value for a guild.
 * @param {string} guildId - The ID of the guild.
 * @param {string} key - The configuration key.
 * @param {*} value - The value to set.
 * @returns {Promise<void>}
 */
async function setGuildConfig(guildId, key, value) {
  await db.read();
  db.data.guilds[guildId] ||= {};
  db.data.guilds[guildId][key] = value;
  await db.write();
}

/**
 * Gets a configuration value for a user.
 * @param {string} userId - The ID of the user.
 * @param {string} key - The configuration key.
 * @param {*} [def] - The default value to return if the key is not found.
 * @returns {Promise<*>} The configuration value.
 */
async function getUserConfig(userId, key, def) {
  await db.read();
  return db.data.users?.[userId]?.[key] ?? def;
}

/**
 * Sets a configuration value for a user.
 * @param {string} userId - The ID of the user.
 * @param {string} key - The configuration key.
 * @param {*} value - The value to set.
 * @returns {Promise<void>}
 */
async function setUserConfig(userId, key, value) {
  await db.read();
  db.data.users ||= {};
  db.data.users[userId] ||= {};
  db.data.users[userId][key] = value;
  await db.write();
}

module.exports = { init, getGuildConfig, setGuildConfig, getUserConfig, setUserConfig };


