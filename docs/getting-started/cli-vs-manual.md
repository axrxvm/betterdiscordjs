# CLI vs Manual Setup Comparison

This document compares the CLI scaffolding tool with manual project setup.

## Time Comparison

| Method | Setup Time | Complexity |
|--------|------------|------------|
| **CLI** | ~30 seconds | ⭐ Easy |
| **Manual** | ~5-10 minutes | ⭐⭐⭐ Moderate |

## CLI Setup

### Commands
```bash
npx @axrxvm/betterdiscordjs create my-bot
cd my-bot
# Edit .env with your token
npm start
```

### What You Get
✅ Complete project structure  
✅ Example commands (ping, help, userinfo)  
✅ Example events (ready, guildCreate)  
✅ Environment configuration (.env, .env.example)  
✅ Git configuration (.gitignore)  
✅ Package.json with scripts  
✅ README with instructions  
✅ Auto-installed dependencies  

### Files Created
```
my-bot/
├── commands/
│   ├── ping.js
│   ├── help.js
│   └── userinfo.js
├── events/
│   ├── ready.js
│   └── guildCreate.js
├── data/
│   └── .gitkeep
├── index.js
├── .env
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── node_modules/
```

## Manual Setup

### Commands
```bash
mkdir my-bot
cd my-bot
npm init -y
npm install @axrxvm/betterdiscordjs dotenv
mkdir commands events data
touch index.js .env .gitignore README.md
# Create all command files manually
# Create all event files manually
# Configure package.json
# Write all example code
# Create README
```

### What You Need to Create
❌ Create directory structure manually  
❌ Initialize npm manually  
❌ Install dependencies manually  
❌ Create .env and .gitignore manually  
❌ Write index.js from scratch  
❌ Create example commands manually  
❌ Create example events manually  
❌ Write README manually  

## Feature Comparison

| Feature | CLI | Manual |
|---------|-----|--------|
| Project scaffolding | Automatic | Manual |
| Example commands | ✅ Included | ❌ Write yourself |
| Example events | ✅ Included | ❌ Write yourself |
| .env configuration | ✅ Generated | ❌ Create manually |
| .gitignore | ✅ Configured | ❌ Create manually |
| README | ✅ Generated | ❌ Write yourself |
| Package.json scripts | ✅ Configured | ❌ Add manually |
| Templates | ✅ 3 options | ❌ One approach |
| Auto-install deps | ✅ Optional | ❌ Always manual |
| Interactive setup | ✅ Yes | ❌ No |
| Best practices | ✅ Built-in | ⚠️ Must know |

## CLI Template Options

### Basic Template
Perfect for most users. Includes everything needed to get started quickly.

**Setup:**
```bash
npx @axrxvm/betterdiscordjs create my-bot
# or
npx @axrxvm/betterdiscordjs create my-bot --template basic
```

**Files:** 8 files + 3 commands + 2 events

### Advanced Template
For users who want plugins, configuration, and advanced features.

**Setup:**
```bash
npx @axrxvm/betterdiscordjs create my-bot --template advanced
```

**Files:** 10 files + 5 commands + 3 events + config.json

**Additional features:**
- Plugin system integration
- Configuration file
- Advanced commands (poll, remind)
- Advanced events (auto-moderation example)
- Database setup
- Scheduled tasks

### Minimal Template
For experienced developers who want bare minimum.

**Setup:**
```bash
npx @axrxvm/betterdiscordjs create my-bot --template minimal
```

**Files:** 6 files, 0 commands, 0 events (starter code only)

## When to Use Each Method

### Use CLI When:
✅ You're new to betterdiscordjs  
✅ You want to get started quickly  
✅ You want example code to learn from  
✅ You want best practices built-in  
✅ You're creating multiple bots  
✅ You want consistent project structure  

### Use Manual When:
✅ You're an experienced developer  
✅ You want full control over structure  
✅ You're integrating into existing project  
✅ You have specific requirements  
✅ You prefer building from scratch  

## Recommendation

**For 95% of users:** Use the CLI. It's faster, includes examples, and follows best practices.

**For experienced developers:** Use minimal template or manual setup if you have specific needs.

## Equivalent Manual Setup for CLI Basic Template

If you want to manually recreate what the CLI does:

### 1. Initialize Project
```bash
mkdir my-bot && cd my-bot
npm init -y
npm install @axrxvm/betterdiscordjs dotenv
```

### 2. Create Structure
```bash
mkdir -p commands events data
```

### 3. Create .env
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
DEV_GUILD=your_dev_guild_id_here
PREFIX=!
BOT_OWNER_ID=your_user_id_here
```

### 4. Create .env.example
```env
DISCORD_TOKEN=
CLIENT_ID=
DEV_GUILD=
PREFIX=!
BOT_OWNER_ID=
```

### 5. Create .gitignore
```
node_modules/
.env
data/*.json
!data/.gitkeep
*.log
logs/
.DS_Store
Thumbs.db
.vscode/
.idea/
*.swp
*.swo
```

### 6. Create index.js
```javascript
const { Bot } = require('@axrxvm/betterdiscordjs');
require('dotenv').config();

const bot = new Bot(process.env.DISCORD_TOKEN, {
  prefix: process.env.PREFIX || '!',
  commandsDir: './commands',
  eventsDir: './events',
  devGuild: process.env.DEV_GUILD,
  clientId: process.env.CLIENT_ID
});

bot.onCommandRun((cmd, ctx) => {
  console.log(`✓ Command: ${cmd.name} by ${ctx.user.tag}`);
});

bot.on('ready', (ctx) => {
  console.log(`✓ Bot is ready! Logged in as ${ctx.user.tag}`);
});

bot.start();
```

### 7. Create commands/ping.js
```javascript
module.exports = {
  name: 'ping',
  description: 'Check bot latency',
  slash: true,
  run: async (ctx) => {
    const latency = Date.now() - ctx.createdTimestamp;
    const apiLatency = Math.round(ctx.client.ws.ping);
    
    const embed = ctx.embed()
      .title('🏓 Pong!')
      .field('Bot Latency', `${latency}ms`, true)
      .field('API Latency', `${apiLatency}ms`, true)
      .color('green')
      .timestamp();
    
    await embed.send();
  }
};
```

### 8. Create commands/help.js
```javascript
module.exports = {
  name: 'help',
  description: 'Show all available commands',
  slash: true,
  run: async (ctx) => {
    const commands = Array.from(ctx.bot.commands.values())
      .filter(cmd => !cmd.ownerOnly)
      .map(cmd => `\`${cmd.name}\` - ${cmd.description || 'No description'}`)
      .join('\n');
    
    const embed = ctx.embed()
      .title('📚 Available Commands')
      .desc(commands || 'No commands available')
      .footer('Use !help <command> for more info')
      .color('blue')
      .timestamp();
    
    await embed.send();
  }
};
```

### 9. Create commands/userinfo.js
```javascript
module.exports = {
  name: 'userinfo',
  description: 'Get information about a user',
  slash: true,
  args: {
    usage: '[user]'
  },
  run: async (ctx) => {
    const user = ctx.interaction 
      ? ctx.interaction.options.getUser('user') || ctx.user
      : await ctx.fetchUser(ctx.args[0]) || ctx.user;
    
    const member = ctx.guild ? await ctx.guild.members.fetch(user.id).catch(() => null) : null;
    
    const embed = ctx.embed()
      .title(`👤 User Info: ${user.tag}`)
      .thumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .field('ID', user.id, true)
      .field('Created', `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, true)
      .field('Bot', user.bot ? 'Yes' : 'No', true)
      .color('blue');
    
    if (member) {
      embed.field('Joined Server', `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, true);
      embed.field('Roles', member.roles.cache.size.toString(), true);
    }
    
    await embed.send();
  }
};
```

### 10. Create events/ready.js
```javascript
module.exports = {
  name: 'ready',
  once: true,
  run: (ctx) => {
    console.log(`✓ ${ctx.user.tag} is online!`);
    console.log(`✓ Serving ${ctx.client.guilds.cache.size} guilds`);
    console.log(`✓ Loaded ${ctx.bot.commands.size} commands`);
  }
};
```

### 11. Create events/guildCreate.js
```javascript
module.exports = {
  name: 'guildCreate',
  run: async (ctx, guild) => {
    console.log(`✓ Joined new guild: ${guild.name} (${guild.id})`);
    
    const channel = guild.channels.cache
      .filter(ch => ch.type === 0 && ch.permissionsFor(guild.members.me).has('SendMessages'))
      .first();
    
    if (channel) {
      const embed = ctx.embed()
        .title('👋 Thanks for adding me!')
        .desc('Use `!help` to see available commands.')
        .color('green');
      
      await channel.send({ embeds: [embed.embed] });
    }
  }
};
```

### 12. Update package.json
Add scripts:
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  }
}
```

### 13. Create README.md
(See CLI-generated README for full content)

### 14. Create data/.gitkeep
```bash
touch data/.gitkeep
```

## Time Saved

- **CLI:** 30 seconds + configuration time
- **Manual:** 10-15 minutes minimum

**The CLI saves you ~10-14 minutes per project!**

## Conclusion

The CLI tool automates the tedious parts of project setup, letting you focus on building your bot instead of configuring boilerplate. Unless you have specific requirements, **always use the CLI**.

---

**Try it now:**
```bash
npx @axrxvm/betterdiscordjs create my-bot
```
