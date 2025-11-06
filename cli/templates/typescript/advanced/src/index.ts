import { Bot, plugins } from '@axrxvm/betterdiscordjs';
import { config as dotenvConfig } from 'dotenv';
import config from './config.json';

dotenvConfig();

const bot = new Bot(process.env.DISCORD_TOKEN!, {
  prefix: process.env.PREFIX || config.prefix,
  commandsDir: './dist/commands',
  eventsDir: './dist/events',
  devGuild: process.env.DEV_GUILD,
  clientId: process.env.CLIENT_ID,
  database: {
    type: 'json',
    path: './data/database.json'
  }
});

// Load plugins
if (config.plugins.welcome) {
  bot.use(plugins.WelcomePlugin);
}
if (config.plugins.moderation) {
  bot.use(plugins.ModerationPlugin);
}

// Global command hooks
bot.onCommandRun((cmd, ctx) => {
  ctx.info(`Command executed: ${cmd.name} by ${ctx.user.tag}`);
});

bot.onCommandError((err, cmd, ctx) => {
  ctx.error(`Error in ${cmd.name}: ${err.message}`);
});

// Scheduled tasks
bot.every('30m', () => {
  console.log('Running scheduled task...');
});

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

bot.start();
