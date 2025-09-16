const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

const file = path.resolve(__dirname, '../data/botdata.json');
const adapter = new JSONFile(file);

const db = new Low(adapter, { guilds: {} });

async function init() {
  await db.read();
  db.data ||= { guilds: {} };
  await db.write();
}

async function getGuildConfig(guildId, key, def) {
  await db.read();
  return db.data.guilds[guildId]?.[key] ?? def;
}

async function setGuildConfig(guildId, key, value) {
  await db.read();
  db.data.guilds[guildId] ||= {};
  db.data.guilds[guildId][key] = value;
  await db.write();
}

async function getUserConfig(userId, key, def) {
  await db.read();
  return db.data.users?.[userId]?.[key] ?? def;
}

async function setUserConfig(userId, key, value) {
  await db.read();
  db.data.users ||= {};
  db.data.users[userId] ||= {};
  db.data.users[userId][key] = value;
  await db.write();
}

module.exports = { init, getGuildConfig, setGuildConfig, getUserConfig, setUserConfig };
