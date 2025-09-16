const { Bot, plugins } = require('../index');

// Create a bot with plugins loaded from code
const bot = new Bot(process.env.DISCORD_TOKEN, {
  prefix: '?',
  devGuild: process.env.DEV_GUILD_ID,
  clientId: process.env.CLIENT_ID
})
// Chain plugin loading with fluent API
.use(plugins.WelcomePlugin)
.use(plugins.ModerationPlugin);

// Add some inline commands
bot.command('info', (ctx) => {
  const pluginCount = bot.listPlugins().filter(p => p.loaded).length;
  ctx.reply(`🤖 Bot Info:\n📦 Plugins loaded: ${pluginCount}\n⚡ Commands: ${bot.commands.size}`);
});

bot.command('plugins', (ctx) => {
  const pluginList = bot.listPlugins()
    .map(p => `${p.loaded ? '✅' : '❌'} **${p.name}** v${p.version} - ${p.description}`)
    .join('\n');
  
  ctx.reply(`📦 **Available Plugins:**\n${pluginList}`);
});

// Event handlers
bot.on('ready', (ctx) => {
  console.log(`✅ ${ctx.user.tag} is ready with ${bot.listPlugins().filter(p => p.loaded).length} plugins!`);
});

bot.on('guildMemberAdd', (ctx, member) => {
  console.log(`👋 ${member.user.tag} joined ${member.guild.name}`);
});

// Start the bot
bot.start();