const { Bot } = require('@axrxvm/betterdiscordjs');
require('dotenv').config();

const bot = new Bot(process.env.DISCORD_TOKEN, {
  prefix: process.env.PREFIX || '{{PREFIX}}',
  commandsDir: './commands',
  eventsDir: './events',
  devGuild: process.env.DEV_GUILD,
  clientId: process.env.CLIENT_ID
});

// Global command hooks
bot.onCommandRun((cmd, ctx) => {
  console.log(`✓ Command: ${cmd.name} by ${ctx.user.tag}`);
});

bot.on('ready', (ctx) => {
  console.log(`✓ Bot is ready! Logged in as ${ctx.user.tag}`);
  ctx.client.user.setActivity('{{PREFIX}}help', { type: 'LISTENING' });
});

bot.start();
