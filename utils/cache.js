const db = require('./db');

/**
 * In-memory cache for frequently accessed data, with a database fallback.
 * @type {object}
 */
const cache = { cooldowns: {}, reminders: {}, tempmutes: {} };

/**
 * Sets a command cooldown for a user.
 * @param {string} userId - The ID of the user.
 * @param {string} cmd - The name of the command.
 * @param {number} until - The timestamp until which the cooldown is active.
 * @returns {Promise<void>}
 */
async function setCooldown(userId, cmd, until) {
  cache.cooldowns[userId] = cache.cooldowns[userId] || {};
  cache.cooldowns[userId][cmd] = until;
  await db.setUserConfig(userId, `cooldown_${cmd}`, until);
}

/**
 * Gets the command cooldown for a user.
 * @param {string} userId - The ID of the user.
 * @param {string} cmd - The name of the command.
 * @returns {Promise<number|undefined>} The timestamp until which the cooldown is active.
 */
async function getCooldown(userId, cmd) {
  return cache.cooldowns[userId]?.[cmd] || await db.getUserConfig(userId, `cooldown_${cmd}`);
}

/**
 * Sets a reminder for a user.
 * @param {string} userId - The ID of the user.
 * @param {number} time - The time of the reminder.
 * @param {string} msg - The reminder message.
 * @returns {Promise<void>}
 */
async function setReminder(userId, time, msg) {
  cache.reminders[userId] = { time, msg };
  await db.setUserConfig(userId, 'reminder', { time, msg });
}

/**
 * Gets the reminder for a user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<object|undefined>} The reminder object.
 */
async function getReminder(userId) {
  return cache.reminders[userId] || await db.getUserConfig(userId, 'reminder');
}

/**
 * Sets a temporary mute for a user.
 * @param {string} userId - The ID of the user.
 * @param {number} until - The timestamp until which the mute is active.
 * @returns {Promise<void>}
 */
async function setTempMute(userId, until) {
  cache.tempmutes[userId] = until;
  await db.setUserConfig(userId, 'tempmute', until);
}

/**
 * Gets the temporary mute for a user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<number|undefined>} The timestamp until which the mute is active.
 */
async function getTempMute(userId) {
  return cache.tempmutes[userId] || await db.getUserConfig(userId, 'tempmute');
}

module.exports = { setCooldown, getCooldown, setReminder, getReminder, setTempMute, getTempMute };
