const { Bot, plugins, BasePlugin } = require('../index');

// Example 1: Using built-in plugins with .use() method (fluent API)
const bot = new Bot(process.env.DISCORD_TOKEN, {
  commandsDir: './commands',
  eventsDir: './events',
  prefix: '!'
})
.use(plugins.WelcomePlugin)
.use(plugins.ModerationPlugin);

// Example 2: Creating a custom plugin inline
class CustomPlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    
    this.name = "custom";
    this.version = "1.0.0";
    this.description = "Custom inline plugin";
    this.author = "Developer";
  }

  async onLoad() {
    this.log("Loading custom plugin...");
    
    this.addCommand('hello', async (ctx) => {
      ctx.reply(`Hello ${ctx.user.username}! This is from a custom plugin.`);
    }, {
      description: 'Say hello from custom plugin'
    });

    this.addEvent('messageCreate', async (message) => {
      if (message.content === 'ping') {
        message.reply('Pong from custom plugin!');
      }
    });
    
    this.log("Custom plugin loaded!");
  }
}

// Load custom plugin using .use()
bot.use(CustomPlugin);

// Example 3: Loading plugins after bot creation
async function loadAdditionalPlugins() {
  // Load plugin directly
  await bot.loadPluginFromClass(plugins.AutoModPlugin);
  
  // Or create and load another custom plugin
  class AnotherPlugin extends BasePlugin {
    constructor(bot, pluginManager) {
      super(bot, pluginManager);
      this.name = "another";
      this.version = "1.0.0";
      this.description = "Another custom plugin";
    }

    async onLoad() {
      this.addCommand('test', async (ctx) => {
        ctx.reply('Test command from another plugin!');
      });
    }
  }
  
  await bot.loadPluginFromClass(AnotherPlugin);
}

// Start the bot
bot.start().then(() => {
  console.log('Bot started with plugins loaded from code!');
  
  // Load additional plugins after startup
  setTimeout(loadAdditionalPlugins, 5000);
});

// Example 4: Plugin management at runtime
bot.on('messageCreate', async (ctx) => {
  if (ctx.content === '!plugin-status') {
    const plugins = bot.listPlugins();
    const status = plugins.map(p => 
      `${p.loaded ? '✅' : '❌'} ${p.name} v${p.version}`
    ).join('\n');
    
    ctx.reply(`**Plugin Status:**\n${status}`);
  }
  
  if (ctx.content === '!reload-custom') {
    try {
      await bot.reloadPlugin('custom');
      ctx.reply('✅ Custom plugin reloaded!');
    } catch (error) {
      ctx.reply(`❌ Failed to reload: ${error.message}`);
    }
  }
});