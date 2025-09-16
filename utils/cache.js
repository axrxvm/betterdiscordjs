const db = require('./db');
const cache = { cooldowns: {}, reminders: {}, tempmutes: {} };

async function setCooldown(userId, cmd, until) {
  cache.cooldowns[userId] = cache.cooldowns[userId] || {};
  cache.cooldowns[userId][cmd] = until;
  await db.setUserConfig(userId, `cooldown_${cmd}`, until);
}
async function getCooldown(userId, cmd) {
  return cache.cooldowns[userId]?.[cmd] || await db.getUserConfig(userId, `cooldown_${cmd}`);
}

async function setReminder(userId, time, msg) {
  cache.reminders[userId] = { time, msg };
  await db.setUserConfig(userId, 'reminder', { time, msg });
}
async function getReminder(userId) {
  return cache.reminders[userId] || await db.getUserConfig(userId, 'reminder');
}

async function setTempMute(userId, until) {
  cache.tempmutes[userId] = until;
  await db.setUserConfig(userId, 'tempmute', until);
}
async function getTempMute(userId) {
  return cache.tempmutes[userId] || await db.getUserConfig(userId, 'tempmute');
}

module.exports = { setCooldown, getCooldown, setReminder, getReminder, setTempMute, getTempMute };
