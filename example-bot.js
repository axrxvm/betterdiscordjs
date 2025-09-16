require('dotenv').config();
const { Bot, plugins, BasePlugin } = require('./index');

// Create a custom plugin
class GreetingPlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    
    this.name = "greeting";
    this.version = "1.0.0";
    this.description = "Simple greeting plugin";
    this.author = "BetterDJS";
  }

  async onLoad() {
    this.log("Loading Greeting Plugin...");
    
    // Add a simple greeting command
    this.addCommand('greet', async (ctx) => {
      const user = ctx.args[0] ? ctx.args[0].replace(/[<@!>]/g, '') : ctx.user.id;
      const member = ctx.guild.members.cache.get(user);
      const name = member ? member.displayName : ctx.user.username;
      
      ctx.reply(`👋 Hello ${name}! Welcome to ${ctx.guild.name}!`);
    }, {
      description: 'Greet a user or yourself',
      args: [
        { name: 'user', type: 'user', required: false }
      ]
    });

    // React to messages containing "hello"
    this.addEvent('messageCreate', async (message) => {
      if (message.author.bot) return;
      
      if (message.content.toLowerCase().includes('hello')) {
        await message.react('👋');
      }
    });
    
    this.log("Greeting Plugin loaded successfully!");
  }
}

// Create bot and load plugins from code
const bot = new Bot(process.env.DISCORD_TOKEN, {
  prefix: '!',
  devGuild: process.env.DEV_GUILD_ID,
  clientId: process.env.CLIENT_ID
})
// Load built-in plugins
.use(plugins.WelcomePlugin)
.use(plugins.ModerationPlugin)
// Load custom plugin
.use(GreetingPlugin);

// Add some basic commands
bot.command('ping', (ctx) => {
  ctx.reply('🏓 Pong!');
});

bot.command('info', (ctx) => {
  const loadedPlugins = bot.listPlugins().filter(p => p.loaded);
  const embed = {
    title: '🤖 Bot Information',
    color: 0x00ff00,
    fields: [
      { name: '📦 Plugins', value: `${loadedPlugins.length} loaded`, inline: true },
      { name: '⚡ Commands', value: `${bot.commands.size} total`, inline: true },
      { name: '🔧 Framework', value: 'BetterDJS', inline: true }
    ],
    footer: { text: 'Plugin System Demo' }
  };
  
  ctx.reply({ embeds: [embed] });
});

// Event handlers
bot.on('ready', (ctx) => {
  console.log(`✅ ${ctx.user.tag} is online!`);
  console.log(`📦 Loaded ${bot.listPlugins().filter(p => p.loaded).length} plugins`);
  console.log(`⚡ Registered ${bot.commands.size} commands`);
  
  // Set bot presence
  bot.setPresence({
    activities: [{ name: 'with plugins!', type: 0 }],
    status: 'online'
  });
});

// Start the bot
bot.start().catch(console.error);