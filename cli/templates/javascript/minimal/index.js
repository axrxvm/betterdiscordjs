const { Bot } = require('@axrxvm/betterdiscordjs');
require('dotenv').config();

const bot = new Bot(process.env.DISCORD_TOKEN, {
  prefix: process.env.PREFIX || '{{PREFIX}}'
});

// Quick inline command
bot.command('ping', async (ctx) => {
  await ctx.reply('🏓 Pong!');
});

bot.on('ready', (ctx) => {
  console.log(`✓ ${ctx.user.tag} is ready!`);
});

bot.start();
