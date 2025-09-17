# Configuration

@axrxvm/betterdiscordjs offers extensive configuration options to customize your bot's behavior. This guide covers all available configuration options and best practices.

## Bot Constructor Options

The `Bot` constructor accepts various options to configure your bot:

```javascript
const bot = new Bot(token, {
  // Command system
  commandsDir: './commands',
  eventsDir: './events',
  prefix: '!',
  
  // Slash commands
  slashMode: 'dev', // 'dev', 'global', or 'disabled'
  autoRegisterSlash: true,
  devGuild: 'your_dev_guild_id',
  clientId: 'your_client_id',
  
  // Bot presence
  presence: {
    activities: [{ name: 'with @axrxvm/betterdiscordjs', type: 0 }],
    status: 'online'
  }
});
```

## Configuration Options Reference

### Core Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `commandsDir` | `string` | `null` | Directory containing command files |
| `eventsDir` | `string` | `null` | Directory containing event files |
| `prefix` | `string` | `"!"` | Default command prefix |

### Slash Command Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `slashMode` | `string` | `'global'` | Slash command registration mode |
| `autoRegisterSlash` | `boolean` | `true` | Automatically register slash commands |
| `devGuild` | `string` | `null` | Guild ID for development slash commands |
| `clientId` | `string` | `null` | Bot's client ID for slash commands |

### Presence Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `presence` | `object` | `null` | Initial bot presence configuration |

## Environment Variables

@axrxvm/betterdiscordjs supports configuration through environment variables:

### Required Variables

```env
# Bot authentication
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_bot_client_id_here
```

### Optional Variables

```env
# Development
DEV_GUILD=your_development_guild_id
BOT_OWNER_ID=your_user_id_here

# Logging
BOT_LOG_CHANNEL=log_channel_id_here

# Bot settings
PREFIX=!
MAINTENANCE_MODE=false

# Database (if using external database)
DATABASE_URL=your_database_url
```

### Environment File Example

Create a `.env.example` file for your project:

```env
# Discord Bot Configuration
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_bot_client_id_here

# Development Settings
DEV_GUILD=your_development_guild_id
BOT_OWNER_ID=your_user_id_here

# Optional Settings
PREFIX=!
BOT_LOG_CHANNEL=log_channel_id_here
MAINTENANCE_MODE=false

# Database (optional)
DATABASE_URL=sqlite://./data/bot.db
```

## Slash Command Configuration

### Development Mode

Use development mode for testing slash commands:

```javascript
const bot = new Bot(token, {
  slashMode: 'dev',
  devGuild: process.env.DEV_GUILD,
  clientId: process.env.CLIENT_ID
});
```

**Benefits:**
- Instant command updates
- No global rate limits
- Isolated testing environment

### Global Mode

Use global mode for production:

```javascript
const bot = new Bot(token, {
  slashMode: 'global',
  clientId: process.env.CLIENT_ID
});
```

**Note:** Global commands can take up to 1 hour to update across all servers.

### Disabling Slash Commands

```javascript
const bot = new Bot(token, {
  slashMode: 'disabled',
  autoRegisterSlash: false
});
```

## Presence Configuration

### Static Presence

```javascript
const bot = new Bot(token, {
  presence: {
    activities: [{ 
      name: 'with Discord.js', 
      type: 0 // PLAYING
    }],
    status: 'online'
  }
});
```

### Dynamic Presence

```javascript
bot.on('ready', (ctx) => {
  // Update presence after bot is ready
  bot.setPresence({
    activities: [{ 
      name: `${ctx.client.guilds.cache.size} servers`, 
      type: 3 // WATCHING
    }],
    status: 'online'
  });
});

// Update presence periodically
bot.every('5m', () => {
  bot.setPresence({
    activities: [{ 
      name: `${bot.client.guilds.cache.size} servers`, 
      type: 3
    }],
    status: 'online'
  });
});
```

### Activity Types

| Type | Number | Description |
|------|--------|-------------|
| PLAYING | 0 | Playing {name} |
| STREAMING | 1 | Streaming {name} |
| LISTENING | 2 | Listening to {name} |
| WATCHING | 3 | Watching {name} |
| COMPETING | 5 | Competing in {name} |

### Status Types

- `'online'` - Online (green)
- `'idle'` - Away (yellow)
- `'dnd'` - Do Not Disturb (red)
- `'invisible'` - Invisible (appears offline)

## Directory Structure Configuration

### Default Structure

```
your-bot/
├── commands/
│   ├── general/
│   ├── fun/
│   └── utility/
├── events/
├── plugins/
└── index.js
```

### Custom Structure

```javascript
const bot = new Bot(token, {
  commandsDir: './src/commands',
  eventsDir: './src/events'
});
```

## Database Configuration

@axrxvm/betterdiscordjs uses LowDB by default, but you can configure it:

### Default Configuration

Data is stored in `./data/botdata.json`

### Custom Database Path

```javascript
// In your bot initialization
const path = require('path');
const customDbPath = path.resolve(__dirname, 'custom-data', 'bot.json');

// You would need to modify the db.js utility for custom paths
```

### External Database

For production bots, consider using external databases:

```javascript
// Example with MongoDB (requires additional setup)
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL);

// Use custom database functions instead of built-in db utility
```

## Advanced Configuration

### Command Inhibitors

Add global command restrictions:

```javascript
bot.addInhibitor((cmd, ctx) => {
  // Maintenance mode
  if (process.env.MAINTENANCE_MODE === 'true' && ctx.user.id !== process.env.BOT_OWNER_ID) {
    return '🚧 Bot is in maintenance mode.';
  }
  
  // Blacklisted users
  const blacklist = ['user_id_1', 'user_id_2'];
  if (blacklist.includes(ctx.user.id)) {
    return '❌ You are blacklisted from using this bot.';
  }
  
  // Allow command to proceed
  return true;
});
```

### Error Handling Configuration

```javascript
// Global error handler
bot.onError((error, cmd, ctx) => {
  console.error('Global error:', error);
  
  // Send to error logging channel
  const logChannel = bot.client.channels.cache.get(process.env.BOT_LOG_CHANNEL);
  if (logChannel) {
    logChannel.send(`Error in ${cmd?.name || 'unknown'}: ${error.message}`);
  }
});

// Command-specific error handling
bot.onCommandError(async (error, cmd, ctx) => {
  console.error(`Command error in ${cmd.name}:`, error);
  
  if (!ctx.replied) {
    await ctx.error('An error occurred while executing this command.');
  }
});
```

### Rate Limiting Configuration

```javascript
// Custom rate limiting
const rateLimit = require('./utils/rateLimit');

bot.addInhibitor((cmd, ctx) => {
  // Custom rate limit for specific commands
  if (cmd.name === 'spam-prone-command') {
    if (!rateLimit.check(ctx.user.id, cmd.name, 1, 10000)) { // 1 use per 10 seconds
      return '⏳ You are using this command too frequently.';
    }
  }
  
  return true;
});
```

## Configuration Best Practices

### 1. Use Environment Variables

Never hardcode sensitive information:

```javascript
// ❌ Bad
const bot = new Bot('your_token_here');

// ✅ Good
const bot = new Bot(process.env.DISCORD_TOKEN);
```

### 2. Separate Development and Production

```javascript
const isDev = process.env.NODE_ENV === 'development';

const bot = new Bot(process.env.DISCORD_TOKEN, {
  slashMode: isDev ? 'dev' : 'global',
  devGuild: isDev ? process.env.DEV_GUILD : null,
  prefix: isDev ? '!!' : '!'
});
```

### 3. Validate Configuration

```javascript
function validateConfig() {
  const required = ['DISCORD_TOKEN', 'CLIENT_ID'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    process.exit(1);
  }
}

validateConfig();
```

### 4. Configuration File

For complex configurations, use a config file:

```javascript
// config.js
module.exports = {
  bot: {
    token: process.env.DISCORD_TOKEN,
    prefix: process.env.PREFIX || '!',
    owners: process.env.BOT_OWNERS?.split(',') || [],
  },
  
  features: {
    slashCommands: process.env.ENABLE_SLASH !== 'false',
    autoMod: process.env.ENABLE_AUTOMOD === 'true',
    economy: process.env.ENABLE_ECONOMY === 'true'
  },
  
  channels: {
    logs: process.env.BOT_LOG_CHANNEL,
    errors: process.env.ERROR_LOG_CHANNEL
  }
};

// index.js
const config = require('./config');
const bot = new Bot(config.bot.token, {
  prefix: config.bot.prefix,
  // ... other options
});
```

## Configuration Validation

Create a configuration validator:

```javascript
// utils/configValidator.js
class ConfigValidator {
  static validate() {
    const errors = [];
    
    // Required environment variables
    const required = ['DISCORD_TOKEN', 'CLIENT_ID'];
    required.forEach(key => {
      if (!process.env[key]) {
        errors.push(`Missing required environment variable: ${key}`);
      }
    });
    
    // Validate token format
    if (process.env.DISCORD_TOKEN && !process.env.DISCORD_TOKEN.match(/^[A-Za-z0-9._-]+$/)) {
      errors.push('Invalid Discord token format');
    }
    
    // Validate client ID format
    if (process.env.CLIENT_ID && !process.env.CLIENT_ID.match(/^\d{17,19}$/)) {
      errors.push('Invalid client ID format');
    }
    
    if (errors.length > 0) {
      console.error('Configuration errors:');
      errors.forEach(error => console.error(`  - ${error}`));
      process.exit(1);
    }
    
    console.log('✅ Configuration validated successfully');
  }
}

module.exports = ConfigValidator;
```

Use the validator:

```javascript
// index.js
const ConfigValidator = require('./utils/configValidator');

// Validate configuration before starting
ConfigValidator.validate();

const bot = new Bot(process.env.DISCORD_TOKEN, {
  // ... your configuration
});
```

## Next Steps

Now that you understand configuration:

1. 🏗️ Learn about the [Bot Class](../core/bot-class.md)
2. 📝 Create [Your First Bot](./first-bot.md)
3. 🎯 Explore [Commands](../core/commands.md)
4. 📦 Try the [Plugin System](../plugins/overview.md)

---

**Remember**: Keep your configuration secure and never commit sensitive information to version control!






